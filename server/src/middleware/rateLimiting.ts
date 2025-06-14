import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import logger from '../utils/logger';

interface RateLimitConfig {
  windowMs: number; // Tidsvindu i millisekunder
  maxRequests: number; // Maks antall requests per tidsvindu
  message?: string; // Egendefinert feilmelding
  skipSuccessfulRequests?: boolean; // Ikke tell vellykkede requests
  skipFailedRequests?: boolean; // Ikke tell feilede requests
  keyGenerator?: (req: Request) => string; // Egendefinert nøkkel for tracking
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// In-memory store for rate limiting (i produksjon bør Redis brukes)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstRequest > 24 * 60 * 60 * 1000) { // 24 timer
      store.delete(key);
    }
  }
}, 60 * 60 * 1000); // Kjør hver time

/**
 * Standard key generator basert på IP adresse
 */
const defaultKeyGenerator = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  return `rate_limit:${ip}`;
};

/**
 * Key generator basert på bruker-ID (for autentiserte requests)
 */
export const userBasedKeyGenerator = (req: Request): string => {
  const authReq = req as any;
  const userId = authReq.bruker?.id;
  if (userId) {
    return `rate_limit:user:${userId}`;
  }
  return defaultKeyGenerator(req);
};

/**
 * Key generator basert på endpoint (for å ha forskjellige limits per endpoint)
 */
export const endpointBasedKeyGenerator = (req: Request): string => {
  const baseKey = defaultKeyGenerator(req);
  const endpoint = `${req.method}:${req.route?.path || req.path}`;
  return `${baseKey}:${endpoint}`;
};

/**
 * Opprett rate limiting middleware
 */
export const createRateLimit = (config: RateLimitConfig) => {
  const {
    windowMs,
    maxRequests,
    message = 'For mange forespørsler. Prøv igjen senere.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = defaultKeyGenerator
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // Hent eksisterende entry eller opprett ny
      let entry = store.get(key);
      
      if (!entry || (now - entry.firstRequest) > windowMs) {
        // Ny entry eller utløpt tidsvindu
        entry = {
          count: 0,
          firstRequest: now,
          lastRequest: now
        };
      }

      // Inkrementer count
      entry.count++;
      entry.lastRequest = now;
      store.set(key, entry);

      // Sjekk om limit er overskredet
      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.firstRequest + windowMs - now) / 1000);
        
        logger.warn('Rate limit overskredet', {
          key,
          count: entry.count,
          maxRequests,
          windowMs,
          retryAfter,
          requestId: (req as any).requestId,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          endpoint: `${req.method} ${req.originalUrl}`
        });

        // Legg til rate limit headers
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(entry.firstRequest + windowMs).toISOString(),
          'Retry-After': retryAfter.toString()
        });

        throw new RateLimitError(retryAfter);
      }

      // Legg til rate limit headers for vellykkede requests
      const remaining = Math.max(0, maxRequests - entry.count);
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(entry.firstRequest + windowMs).toISOString()
      });

      // Intercept response for å håndtere skipSuccessfulRequests/skipFailedRequests
      const originalSend = res.send;
      res.send = function(this: Response, data: any) {
        const statusCode = this.statusCode;
        
        // Sjekk om vi skal ignorere denne requesten
        const shouldSkip = 
          (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
          (skipFailedRequests && statusCode >= 400);

        if (shouldSkip) {
          // Reduser count igjen
          const currentEntry = store.get(key);
          if (currentEntry && currentEntry.count > 0) {
            currentEntry.count--;
            store.set(key, currentEntry);
          }
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Predefinerte rate limit konfigurasjoner
export const rateLimitConfigs = {
  // Strikt rate limiting for sensitive operasjoner
  strict: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutter
    maxRequests: 5,
    message: 'For mange forsøk på sensitiv operasjon. Prøv igjen om 15 minutter.'
  }),

  // Moderat rate limiting for standard API calls
  moderate: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutter
    maxRequests: 100,
    skipSuccessfulRequests: false
  }),

  // Liberal rate limiting for offentlige endpoints
  liberal: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutter
    maxRequests: 1000,
    skipSuccessfulRequests: true
  }),

  // Innlogging rate limiting
  login: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutter
    maxRequests: 5,
    message: 'For mange innloggingsforsøk. Prøv igjen om 15 minutter.',
    skipSuccessfulRequests: true, // Kun tell feilede innlogginger
    keyGenerator: (req: Request) => {
      const ip = req.ip || req.connection.remoteAddress;
      const email = req.body?.epost || 'unknown';
      return `login_attempts:${ip}:${email}`;
    }
  }),

  // Per-user rate limiting for autentiserte requests
  perUser: createRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutt
    maxRequests: 60, // 60 requests per minutt per bruker
    keyGenerator: userBasedKeyGenerator
  }),

  // File upload rate limiting
  fileUpload: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 time
    maxRequests: 10,
    message: 'For mange filopplastinger. Prøv igjen om en time.'
  }),

  // Email sending rate limiting
  emailSending: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 time
    maxRequests: 50,
    message: 'For mange e-poster sendt. Prøv igjen om en time.',
    keyGenerator: userBasedKeyGenerator
  }),

  // Administrative operations
  admin: createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutter
    maxRequests: 20,
    keyGenerator: userBasedKeyGenerator
  })
};

// Middleware for å logge rate limit statistikk
export const rateLimitStatsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(this: Response, data: any) {
    // Log rate limit headers hvis de finnes
    const limit = this.get('X-RateLimit-Limit');
    const remaining = this.get('X-RateLimit-Remaining');
    
    if (limit && remaining) {
      logger.debug('Rate limit stats', {
        requestId: (req as any).requestId,
        endpoint: `${req.method} ${req.originalUrl}`,
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        used: parseInt(limit) - parseInt(remaining),
        statusCode: this.statusCode,
        userId: (req as any).bruker?.id
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

// Hjelpefunksjon for å få rate limit status
export const getRateLimitStatus = (key: string): {
  count: number;
  remaining: number;
  resetTime: Date;
} | null => {
  const entry = store.get(key);
  if (!entry) return null;

  return {
    count: entry.count,
    remaining: Math.max(0, 100 - entry.count), // Default max 100
    resetTime: new Date(entry.firstRequest + 15 * 60 * 1000) // Default 15 min window
  };
};

// Hjelpefunksjon for å slette rate limit entry (for testing eller admin reset)
export const resetRateLimit = (key: string): boolean => {
  return store.delete(key);
};

// Hjelpefunksjon for å få alle active rate limits (for admin/debugging)
export const getAllRateLimits = (): Array<{
  key: string;
  count: number;
  firstRequest: Date;
  lastRequest: Date;
}> => {
  const results = [];
  for (const [key, entry] of store.entries()) {
    results.push({
      key,
      count: entry.count,
      firstRequest: new Date(entry.firstRequest),
      lastRequest: new Date(entry.lastRequest)
    });
  }
  return results;
}; 
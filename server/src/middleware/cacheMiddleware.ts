import type { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/CacheService';

interface CacheOptions {
  ttl?: number;
  key?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
  invalidationTags?: string[];
  skipCache?: (req: Request) => boolean;
}

// Generate cache key from request
function generateCacheKey(req: Request, customKeyFn?: (req: Request) => string): string {
  if (customKeyFn) {
    return customKeyFn(req);
  }

  const { method, path, query, params } = req;
  const userId = (req as any).user?.id || 'anonymous';
  
  // Sort query parameters for consistent cache keys
  const sortedQuery = Object.keys(query)
    .sort()
    .reduce((result, key) => {
      result[key] = query[key];
      return result;
    }, {} as any);

  return `api:${method}:${path}:${userId}:${JSON.stringify(params)}:${JSON.stringify(sortedQuery)}`;
}

// Cache middleware for GET requests
export function cacheGet(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if condition not met
    if (options.skipCache && options.skipCache(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req, options.key);

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Check condition if provided
          if (!options.condition || options.condition(req, res)) {
            cacheService.set(cacheKey, data, options.ttl).catch(error => {
              console.error('Failed to cache response:', error);
            });
          }
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

// Cache invalidation middleware
export function invalidateCache(patterns: string[] | ((req: Request) => string[])) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      // Only invalidate on successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const invalidationPatterns = typeof patterns === 'function' ? patterns(req) : patterns;
        
        Promise.all(invalidationPatterns.map(pattern => 
          cacheService.invalidate(pattern)
        )).catch(error => {
          console.error('Failed to invalidate cache:', error);
        });
      }

      return originalJson(data);
    };

    next();
  };
}

// User-specific cache middleware
export function cacheUserData(dataType: string, options: Omit<CacheOptions, 'key'> = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return next();
    }

    try {
      // Try to get from user cache
      const cached = await cacheService.getUserData(userId, dataType);
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Type', 'USER');
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      res.json = function(data: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (!options.condition || options.condition(req, res)) {
                         cacheService.cacheUserData(userId, dataType, data, options.ttl).catch((error: unknown) => {
               console.error('Failed to cache user data:', error);
             });
          }
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Type', 'USER');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('User cache middleware error:', error);
      next();
    }
  };
}

// Session-based caching
export function cacheSession(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const sessionId = req.sessionID;
    if (!sessionId) {
      return next();
    }

    const cacheKey = `session:${sessionId}:${generateCacheKey(req, options.key)}`;

    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Type', 'SESSION');
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);

      res.json = function(data: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (!options.condition || options.condition(req, res)) {
            cacheService.set(cacheKey, data, options.ttl).catch(error => {
              console.error('Failed to cache session data:', error);
            });
          }
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Type', 'SESSION');
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Session cache middleware error:', error);
      next();
    }
  };
}

// Rate limiting with cache
export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator 
      ? options.keyGenerator(req) 
      : `rate_limit:${req.ip}:${req.path}`;

    try {
      const current = await cacheService.incrementCounter(key, Math.ceil(options.windowMs / 1000));

      res.set('X-RateLimit-Limit', options.maxRequests.toString());
      res.set('X-RateLimit-Remaining', Math.max(0, options.maxRequests - current).toString());
      res.set('X-RateLimit-Reset', new Date(Date.now() + options.windowMs).toISOString());

      if (current > options.maxRequests) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded'
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
}

// Cache warming middleware
export function warmCache(warmer: () => Promise<void>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run cache warming in background
    warmer().catch(error => {
      console.error('Cache warming error:', error);
    });

    next();
  };
}

// Cache statistics middleware
export function cacheStats() {
  const stats = {
    hits: 0,
    misses: 0,
    errors: 0
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      const cacheHeader = res.get('X-Cache');
      if (cacheHeader === 'HIT') {
        stats.hits++;
      } else if (cacheHeader === 'MISS') {
        stats.misses++;
      }

      // Add stats to admin responses
      if (req.path.includes('/admin') || req.path.includes('/stats')) {
        res.set('X-Cache-Stats', JSON.stringify(stats));
      }

      return originalJson(data);
    };

    next();
  };
}

// Health check for cache
export async function cacheHealth(): Promise<{ status: string; details: any }> {
  try {
    const isHealthy = await cacheService.healthCheck();
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details: {
        type: process.env.REDIS_HOST ? 'redis' : 'memory',
        connected: isHealthy,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
         return {
       status: 'error',
       details: {
         error: error instanceof Error ? error.message : String(error),
         timestamp: new Date().toISOString()
       }
     };
  }
}
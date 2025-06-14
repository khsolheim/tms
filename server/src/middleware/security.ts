import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';
import path from 'path';
import logger from '../utils/logger';
import { ValidationError, ForbiddenError } from '../utils/errors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { SecurityValidation } from '../utils/security-validation';
import { AppError } from '../utils/errors';

/**
 * XSS Protection Middleware
 * Sanitiserer HTML input for å forhindre XSS-angrep
 */
export const xssProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize route parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    // Set security headers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    next();
  } catch (error) {
    logger.error('XSS protection error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: (req as any).requestId,
      url: req.originalUrl
    });
    next(error);
  }
};

/**
 * Recursively sanitize an object's string values
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Also sanitize the key
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize a string to prevent XSS
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;
  
  // Use DOMPurify to sanitize HTML
  const cleaned = DOMPurify.sanitize(str, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
  
  // Additional cleaning for common injection patterns
  return cleaned
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/eval\s*\(/gi, '') // Remove eval calls
    .replace(/expression\s*\(/gi, ''); // Remove CSS expressions
}

/**
 * Path Traversal Protection Middleware
 * Forhindrer path traversal angrep (../../../etc/passwd)
 */
export const pathTraversalProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check all string parameters for path traversal attempts
    const checkForPathTraversal = (value: string): boolean => {
      const dangerous = [
        '../', '..\\', '..%2f', '..%2F', '..%5c', '..%5C',
        '%2e%2e%2f', '%2e%2e%5c', '%2E%2E%2F', '%2E%2E%5C',
        '....//....\\\\', '....\\\\....//']
      
      return dangerous.some(pattern => 
        value.toLowerCase().includes(pattern.toLowerCase())
      );
    };

    // Check all request data
    const checkObjectForPathTraversal = (obj: any): void => {
      if (typeof obj === 'string' && checkForPathTraversal(obj)) {
        logger.warn('Path traversal attempt detected', {
          requestId: (req as any).requestId,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          suspiciousValue: obj,
          userId: (req as any).bruker?.id
        });
        
        throw new ForbiddenError('Ugyldig filsti detektert');
      }
      
      if (Array.isArray(obj)) {
        obj.forEach(checkObjectForPathTraversal);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(checkObjectForPathTraversal);
      }
    };

    checkObjectForPathTraversal(req.body);
    checkObjectForPathTraversal(req.query);
    checkObjectForPathTraversal(req.params);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * SQL Injection Protection Middleware
 * Detekterer potensielle SQL injection forsøk
 */
export const sqlInjectionProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /('|("|`|;|\/\*|\*\/|--|\|\|))/gi,
      /(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)/gi,
      /(CHAR\(|CHR\(|ASCII\(|SUBSTRING\()/gi,
      /(LOAD_FILE\(|INTO\s+OUTFILE|INTO\s+DUMPFILE)/gi,
      /(BENCHMARK\(|SLEEP\(|pg_sleep\()/gi
    ];

    const checkForSQLInjection = (value: string): boolean => {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    const checkObjectForSQLInjection = (obj: any): void => {
      if (typeof obj === 'string' && checkForSQLInjection(obj)) {
        logger.warn('SQL injection attempt detected', {
          requestId: (req as any).requestId,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          suspiciousValue: obj.substring(0, 100), // Log only first 100 chars
          userId: (req as any).bruker?.id
        });
        
        throw new ForbiddenError('Ugyldig SQL-kommando detektert');
      }
      
      if (Array.isArray(obj)) {
        obj.forEach(checkObjectForSQLInjection);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(checkObjectForSQLInjection);
      }
    };

    checkObjectForSQLInjection(req.body);
    checkObjectForSQLInjection(req.query);
    checkObjectForSQLInjection(req.params);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Command Injection Protection Middleware
 * Forhindrer command injection angrep
 */
export const commandInjectionProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const commandInjectionPatterns = [
      /(\||&|;|\$\(|\`|<|>)/g,
      /(nc|netcat|wget|curl|chmod|rm|mv|cp|cat|ls|ps|kill|sudo|su)/gi,
      /(eval|exec|system|shell_exec|passthru|proc_open)/gi,
      /(\${|%{|#{|\|\|)/g
    ];

    const checkForCommandInjection = (value: string): boolean => {
      return commandInjectionPatterns.some(pattern => pattern.test(value));
    };

    const checkObjectForCommandInjection = (obj: any): void => {
      if (typeof obj === 'string' && checkForCommandInjection(obj)) {
        logger.warn('Command injection attempt detected', {
          requestId: (req as any).requestId,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          suspiciousValue: obj.substring(0, 100),
          userId: (req as any).bruker?.id
        });
        
        throw new ForbiddenError('Ugyldig kommando detektert');
      }
      
      if (Array.isArray(obj)) {
        obj.forEach(checkObjectForCommandInjection);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(checkObjectForCommandInjection);
      }
    };

    checkObjectForCommandInjection(req.body);
    checkObjectForCommandInjection(req.query);
    checkObjectForCommandInjection(req.params);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Request Size Validation Middleware
 * Begrenser størrelsen på requests for å forhindre DoS
 */
export const requestSizeValidationMiddleware = (options: {
  maxBodySize?: number; // bytes
  maxQueryLength?: number; // characters
  maxUrlLength?: number; // characters
  maxHeaderSize?: number; // bytes
} = {}) => {
  const {
    maxBodySize = 10 * 1024 * 1024, // 10MB default
    maxQueryLength = 2048,
    maxUrlLength = 2048,
    maxHeaderSize = 8192
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check URL length
      if (req.originalUrl.length > maxUrlLength) {
        logger.warn('Oversized URL detected', {
          requestId: (req as any).requestId,
          urlLength: req.originalUrl.length,
          maxAllowed: maxUrlLength,
          ip: req.ip
        });
        
        throw new ValidationError('URL er for lang');
      }

      // Check query string length
      const queryString = JSON.stringify(req.query);
      if (queryString.length > maxQueryLength) {
        logger.warn('Oversized query string detected', {
          requestId: (req as any).requestId,
          queryLength: queryString.length,
          maxAllowed: maxQueryLength,
          ip: req.ip
        });
        
        throw new ValidationError('Query parametere er for lange');
      }

      // Check headers size
      const headersSize = JSON.stringify(req.headers).length;
      if (headersSize > maxHeaderSize) {
        logger.warn('Oversized headers detected', {
          requestId: (req as any).requestId,
          headersSize,
          maxAllowed: maxHeaderSize,
          ip: req.ip
        });
        
        throw new ValidationError('Request headers er for store');
      }

      // Body size is typically handled by express.json() and express.urlencoded()
      // but we can add additional validation here
      if (req.headers['content-length']) {
        const contentLength = parseInt(req.headers['content-length']);
        if (contentLength > maxBodySize) {
          logger.warn('Oversized body detected', {
            requestId: (req as any).requestId,
            bodySize: contentLength,
            maxAllowed: maxBodySize,
            ip: req.ip
          });
          
          throw new ValidationError('Request body er for stor');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Content Type Validation Middleware
 * Validerer at Content-Type header matcher forventet type
 */
export const contentTypeValidationMiddleware = (allowedTypes: string[] = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data'
]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip validation for GET requests without body
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      logger.warn('Missing Content-Type header', {
        requestId: (req as any).requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      });
      
      return next(new ValidationError('Content-Type header er påkrevd'));
    }

    // Extract base content type (without charset, boundary, etc.)
    const baseContentType = contentType.split(';')[0].trim().toLowerCase();
    
    if (!allowedTypes.includes(baseContentType)) {
      logger.warn('Invalid Content-Type', {
        requestId: (req as any).requestId,
        contentType: baseContentType,
        allowedTypes,
        ip: req.ip
      });
      
      return next(new ValidationError(`Ugyldig Content-Type: ${baseContentType}`));
    }

    next();
  };
};

/**
 * User Agent Validation Middleware
 * Blokkerer kjente bot patterns og mistenkelige user agents
 */
export const userAgentValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('user-agent') || '';
  
  // Suspicious patterns
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /zgrab/i,
    /curl.*python/i,
    /python.*requests/i,
    /bot.*attack/i,
    /hack/i,
    /exploit/i
  ];

  // Check for suspicious patterns
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logger.warn('Suspicious user agent detected', {
      requestId: (req as any).requestId,
      userAgent,
      ip: req.ip,
      url: req.originalUrl
    });
    
    // Could return 403 or continue with extra logging
    // For now, just log and continue
  }

  // Block completely empty user agents for API endpoints
  if (!userAgent && req.originalUrl.startsWith('/api/')) {
    logger.warn('Empty user agent on API request', {
      requestId: (req as any).requestId,
      ip: req.ip,
      url: req.originalUrl
    });
  }

  next();
};

/**
 * IP Validation Middleware
 * Kan brukes til å blokkere kjente ondsinnede IP-adresser
 */
export const ipValidationMiddleware = (blockedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.connection.remoteAddress;
    
    if (ip && blockedIPs.includes(ip)) {
      logger.warn('Blocked IP address attempt', {
        requestId: (req as any).requestId,
        ip,
        url: req.originalUrl,
        userAgent: req.get('user-agent')
      });
      
      throw new ForbiddenError('Tilgang nektet');
    }
    
    next();
  };
};

/**
 * Security Headers Middleware
 * Setter sikkerhetsorienterte HTTP headers
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );

  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Only set HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

/**
 * Combined security middleware
 * Kombinerer alle security middleware i riktig rekkefølge
 */
export const combinedSecurityMiddleware = [
  securityHeadersMiddleware,
  userAgentValidationMiddleware,
  requestSizeValidationMiddleware(),
  pathTraversalProtectionMiddleware,
  sqlInjectionProtectionMiddleware,
  commandInjectionProtectionMiddleware,
  xssProtectionMiddleware
];

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = SecurityValidation.sanitizeAllInputs(req.body);
    }

    next();
  } catch (error) {
    logger.error('Error in input sanitization middleware', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: (req as any).requestId,
      ip: req.ip
    });
    next(new AppError('Feil ved behandling av input', 400, 'VALIDATION_ERROR'));
  }
};

/**
 * General API rate limiting
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'For mange API kall, prøv igjen om 15 minutter'
});

/**
 * Authentication rate limiting
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: 'For mange innloggingsforsøk, prøv igjen om 15 minutter'
});

/**
 * Security headers configuration
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}); 
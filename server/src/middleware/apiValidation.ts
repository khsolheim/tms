import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ValidationError } from '../utils/errors';

/**
 * API Request Validation Middleware
 * Validerer request body, query parameters, headers, content-type og request size limits
 */

/**
 * Request Body Validation Middleware
 * Validerer at request body er gyldig JSON og ikke tom når påkrevd
 */
export const requestBodyValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip validation for GET, HEAD, DELETE requests
    if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // POST and PUT requests should have a body
    if (['POST', 'PUT'].includes(req.method)) {
      if (!req.body || Object.keys(req.body).length === 0) {
        logger.warn('Empty request body on POST/PUT request', {
          requestId: (req as any).requestId,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip
        });
        
        return next(new ValidationError('Request body er påkrevd for denne operasjonen'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Query Parameter Validation Middleware
 * Validerer query parameters for farlige tegn og størrelse
 */
export const queryParameterValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query;
    
    // Check for dangerous characters in query parameters
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        // Check for SQL injection attempts
        const dangerousPatterns = [
          /(\bSELECT\b.*\bFROM\b)/gi,
          /(\bUNION\b.*\bSELECT\b)/gi,
          /(\bDROP\b.*\bTABLE\b)/gi,
          /(--|\/\*|\*\/)/g,
          /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi,
          /(javascript:)/gi
        ];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(value)) {
            logger.warn('Dangerous query parameter detected', {
              requestId: (req as any).requestId,
              key,
              value: value.substring(0, 100),
              ip: req.ip,
              url: req.originalUrl
            });
            
            return next(new ValidationError(`Ugyldig verdi i query parameter: ${key}`));
          }
        }

        // Check for null bytes
        if (value.includes('\0')) {
          logger.warn('Null byte in query parameter', {
            requestId: (req as any).requestId,
            key,
            ip: req.ip
          });
          
          return next(new ValidationError(`Ugyldig tegn i query parameter: ${key}`));
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Header Validation Middleware
 * Validerer viktige headers og sjekker for farlige verdier
 */
export const headerValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const headers = req.headers;
    
    // Validate Authorization header format if present
    if (headers.authorization) {
      const authHeader = headers.authorization;
      
      // Check for Bearer token format
      if (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('bearer ')) {
        logger.warn('Invalid Authorization header format', {
          requestId: (req as any).requestId,
          authHeader: authHeader.substring(0, 20),
          ip: req.ip
        });
        
        return next(new ValidationError('Ugyldig Authorization header format'));
      }
    }

    // Validate Content-Length if present
    if (headers['content-length']) {
      const contentLength = parseInt(headers['content-length']);
      if (isNaN(contentLength) || contentLength < 0) {
        logger.warn('Invalid Content-Length header', {
          requestId: (req as any).requestId,
          contentLength: headers['content-length'],
          ip: req.ip
        });
        
        return next(new ValidationError('Ugyldig Content-Length header'));
      }
    }

    // Check for dangerous headers
    const dangerousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
    for (const header of dangerousHeaders) {
      if (headers[header]) {
        logger.warn('Potentially dangerous header detected', {
          requestId: (req as any).requestId,
          header,
          value: headers[header],
          ip: req.ip
        });
        
        // Log but don't block - these might be legitimate in some setups
      }
    }

    // Validate Host header
    if (headers.host) {
      const host = headers.host;
      
      // Basic validation for host header injection
      if (host.includes(' ') || host.includes('\n') || host.includes('\r')) {
        logger.warn('Invalid Host header detected', {
          requestId: (req as any).requestId,
          host,
          ip: req.ip
        });
        
        return next(new ValidationError('Ugyldig Host header'));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Content-Type Validation Middleware
 * Strengere validering av Content-Type header
 */
export const contentTypeValidationMiddleware = (allowedTypes: string[] = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain'
]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip validation for GET, HEAD, DELETE, OPTIONS requests
      if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(req.method)) {
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

      // Additional validation for specific content types
      if (baseContentType === 'application/json') {
        // Ensure charset is UTF-8 if specified
        if (contentType.includes('charset') && !contentType.toLowerCase().includes('utf-8')) {
          logger.warn('Invalid charset for JSON content type', {
            requestId: (req as any).requestId,
            contentType,
            ip: req.ip
          });
          
          return next(new ValidationError('JSON content må bruke UTF-8 charset'));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Request Size Limits Middleware
 * Mer detaljert validering av request størrelse
 */
export const requestSizeLimitsMiddleware = (options: {
  maxBodySize?: number;      // bytes
  maxQueryLength?: number;   // characters
  maxUrlLength?: number;     // characters
  maxHeaderSize?: number;    // bytes
  maxHeaderCount?: number;   // number of headers
} = {}) => {
  const {
    maxBodySize = 10 * 1024 * 1024,  // 10MB default
    maxQueryLength = 2048,            // 2KB default
    maxUrlLength = 2048,              // 2KB default
    maxHeaderSize = 8192,             // 8KB default
    maxHeaderCount = 50               // 50 headers max
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
        
        return next(new ValidationError('URL er for lang'));
      }

      // Check query string length
      const queryString = new URL(req.originalUrl, 'http://localhost').search;
      if (queryString.length > maxQueryLength) {
        logger.warn('Oversized query string detected', {
          requestId: (req as any).requestId,
          queryLength: queryString.length,
          maxAllowed: maxQueryLength,
          ip: req.ip
        });
        
        return next(new ValidationError('Query parametere er for lange'));
      }

      // Check headers size and count
      const headerCount = Object.keys(req.headers).length;
      if (headerCount > maxHeaderCount) {
        logger.warn('Too many headers', {
          requestId: (req as any).requestId,
          headerCount,
          maxAllowed: maxHeaderCount,
          ip: req.ip
        });
        
        return next(new ValidationError('For mange headers'));
      }

      const headersSize = JSON.stringify(req.headers).length;
      if (headersSize > maxHeaderSize) {
        logger.warn('Oversized headers detected', {
          requestId: (req as any).requestId,
          headersSize,
          maxAllowed: maxHeaderSize,
          ip: req.ip
        });
        
        return next(new ValidationError('Request headers er for store'));
      }

      // Check body size
      if (req.headers['content-length']) {
        const contentLength = parseInt(req.headers['content-length']);
        if (contentLength > maxBodySize) {
          logger.warn('Oversized body detected', {
            requestId: (req as any).requestId,
            bodySize: contentLength,
            maxAllowed: maxBodySize,
            ip: req.ip
          });
          
          return next(new ValidationError('Request body er for stor'));
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Combined API validation middleware
 * Kombinerer alle API validerings middleware
 */
export const combinedApiValidationMiddleware = [
  requestSizeLimitsMiddleware(),
  headerValidationMiddleware,
  contentTypeValidationMiddleware(),
  queryParameterValidationMiddleware,
  requestBodyValidationMiddleware
];

/**
 * API endpoint specific validation
 * Kan brukes for spesifikke endpoints som trenger strengere validering
 */
export const strictApiValidationMiddleware = [
  requestSizeLimitsMiddleware({
    maxBodySize: 1024 * 1024,  // 1MB for sensitive endpoints
    maxQueryLength: 512,        // 512 bytes
    maxUrlLength: 1024,         // 1KB
    maxHeaderSize: 4096,        // 4KB
    maxHeaderCount: 20          // 20 headers max
  }),
  headerValidationMiddleware,
  contentTypeValidationMiddleware(['application/json']), // Only JSON for strict endpoints
  queryParameterValidationMiddleware,
  requestBodyValidationMiddleware
]; 
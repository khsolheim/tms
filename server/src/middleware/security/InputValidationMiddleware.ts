import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import { ForbiddenError, ValidationError } from '../../utils/errors';

/**
 * XSS Protection Middleware
 * Forhindrer Cross-Site Scripting (XSS) angrep
 */
export const xssProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<\s*\/?(?:object|embed|form|link|meta)\b/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi
    ];

    const checkForXSS = (value: string): boolean => {
      return xssPatterns.some(pattern => pattern.test(value));
    };

    const sanitizeXSS = (obj: any): void => {
      if (typeof obj === 'string' && checkForXSS(obj)) {
        logger.warn('XSS attempt detected', {
          requestId: (req as any).requestId,
          url: req.originalUrl,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          suspiciousValue: obj.substring(0, 100),
          userId: (req as any).bruker?.id
        });
        
        throw new ForbiddenError('Potensielt farlig innhold detektert');
      }
      
      if (Array.isArray(obj)) {
        obj.forEach(sanitizeXSS);
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(sanitizeXSS);
      }
    };

    sanitizeXSS(req.body);
    sanitizeXSS(req.query);
    sanitizeXSS(req.params);

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Path Traversal Protection Middleware
 * Forhindrer path traversal angrep (../../../etc/passwd)
 */
export const pathTraversalProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const checkForPathTraversal = (value: string): boolean => {
      const dangerous = [
        '../', '..\\', '..%2f', '..%2F', '..%5c', '..%5C',
        '%2e%2e%2f', '%2e%2e%5c', '%2E%2E%2F', '%2E%2E%5C',
        '....//....\\\\', '....\\\\....//']
      
      return dangerous.some(pattern => 
        value.toLowerCase().includes(pattern.toLowerCase())
      );
    };

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
          suspiciousValue: obj.substring(0, 100),
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
 * Input Sanitization Middleware
 * Renser inndata for vanlige angrep
 */
export const sanitizeInputMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sanitizeString = (str: string): string => {
      return str
        .trim()
        .replace(/[\x00-\x1F\x7F]/g, '') // Fjern kontrollkarakterer
        .replace(/[\x80-\xFF]/g, (match) => { // Håndter høye ASCII-verdier
          return encodeURIComponent(match);
        });
    };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      
      return obj;
    };

    // Saniter input data
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Error in input sanitization', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: (req as any).requestId
    });
    next(error);
  }
};

/**
 * Request Size Validation Middleware
 * Begrenser størrelsen på requests for å forhindre DoS
 */
export const requestSizeValidationMiddleware = (options: {
  maxBodySize?: number;
  maxQueryLength?: number;
  maxUrlLength?: number;
  maxHeaderSize?: number;
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

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Combined Input Validation Middleware
 * Kombinerer alle input validation middleware
 */
export const combinedInputValidationMiddleware = [
  sanitizeInputMiddleware,
  requestSizeValidationMiddleware(),
  pathTraversalProtectionMiddleware,
  sqlInjectionProtectionMiddleware,
  commandInjectionProtectionMiddleware,
  xssProtectionMiddleware
]; 
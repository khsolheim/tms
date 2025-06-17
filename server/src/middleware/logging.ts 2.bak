import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger, { securityLog, performanceLogDetailed, auditLogDetailed } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface RequestWithLogging extends Request {
  requestId: string;
  startTime: number;
  logger: ReturnType<typeof logger.withContext>;
}

interface LoggingOptions {
  skipPaths?: string[];
  skipMethods?: string[];
  logBody?: boolean;
  logHeaders?: boolean;
  logQuery?: boolean;
  sensitiveFields?: string[];
  maxBodySize?: number;
}

// ============================================================================
// LOGGING MIDDLEWARE
// ============================================================================

export const loggingMiddleware = (options: LoggingOptions = {}) => {
  const {
    skipPaths = ['/health', '/metrics', '/favicon.ico'],
    skipMethods = ['OPTIONS'],
    logBody = false,
    logHeaders = false,
    logQuery = true,
    sensitiveFields = ['password', 'passord', 'token', 'secret', 'authorization'],
    maxBodySize = 1024 * 10 // 10KB
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const extendedReq = req as RequestWithLogging;
    
    // Skip logging for certain paths and methods
    if (skipPaths.some(path => req.path.startsWith(path)) || 
        skipMethods.includes(req.method)) {
      return next();
    }

    // Generate request ID and start time
    (extendedReq as any).requestId = uuidv4();
    extendedReq.startTime = Date.now();

    // Create contextual logger
    extendedReq.logger = logger.withContext({
      requestId: (extendedReq as any).requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).bruker?.id
    });

    // Prepare request data for logging
    const requestData: any = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: (extendedReq as any).requestId
    };

    // Add query parameters if enabled
    if (logQuery && Object.keys(req.query).length > 0) {
      requestData.query = sanitizeData(req.query, sensitiveFields);
    }

    // Add headers if enabled
    if (logHeaders) {
      requestData.headers = sanitizeData(req.headers, sensitiveFields);
    }

    // Add body if enabled and present
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.length <= maxBodySize) {
        requestData.body = sanitizeData(req.body, sensitiveFields);
      } else {
        requestData.body = `[BODY TOO LARGE: ${bodyString.length} bytes]`;
      }
    }

    // Log incoming request
    extendedReq.logger.info('Incoming request', requestData);

    // Override res.json to capture response data
    const originalJson = res.json;
    res.json = function(body: any) {
      const duration = Date.now() - extendedReq.startTime;
      
      // Log response
      const responseData: any = {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        requestId: (extendedReq as any).requestId
      };

      // Add response body for errors or if explicitly enabled
      if (res.statusCode >= 400 || logBody) {
        const responseString = JSON.stringify(body);
        if (responseString.length <= maxBodySize) {
          responseData.body = sanitizeData(body, sensitiveFields);
        } else {
          responseData.body = `[RESPONSE TOO LARGE: ${responseString.length} bytes]`;
        }
      }

      // Choose log level based on status code
      if (res.statusCode >= 500) {
        extendedReq.logger.error('Request completed with server error', responseData);
      } else if (res.statusCode >= 400) {
        extendedReq.logger.warn('Request completed with client error', responseData);
      } else {
        extendedReq.logger.info('Request completed successfully', responseData);
      }

      // Log performance metrics
      performanceLogDetailed({
        operation: `${req.method} ${req.route?.path || req.path}`,
        duration,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        metadata: {
          requestId: (extendedReq as any).requestId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      return originalJson.call(this, body);
    };

    // Override res.send to capture non-JSON responses
    const originalSend = res.send;
    res.send = function(body: any) {
      const duration = Date.now() - extendedReq.startTime;
      
      const responseData = {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        requestId: (extendedReq as any).requestId,
        contentType: res.get('Content-Type')
      };

      if (res.statusCode >= 500) {
        extendedReq.logger.error('Request completed with server error', responseData);
      } else if (res.statusCode >= 400) {
        extendedReq.logger.warn('Request completed with client error', responseData);
      } else {
        extendedReq.logger.info('Request completed successfully', responseData);
      }

      // Log performance metrics
      performanceLogDetailed({
        operation: `${req.method} ${req.route?.path || req.path}`,
        duration,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        metadata: {
          requestId: (extendedReq as any).requestId,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

// ============================================================================
// SECURITY LOGGING MIDDLEWARE
// ============================================================================

export const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const extendedReq = req as RequestWithLogging;

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /eval\(/gi, // Code injection
    /exec\(/gi, // Command injection
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  const suspiciousActivity = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (suspiciousActivity) {
    securityLog({
      event: 'suspicious_activity',
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: (req as any).bruker?.id,
      severity: 'high',
      details: {
        url: req.originalUrl,
        method: req.method,
        patterns: suspiciousPatterns.filter(pattern => pattern.test(requestString)).map(p => p.toString()),
        requestId: (extendedReq as any).requestId
      }
    });
  }

  // Log failed authentication attempts
  res.on('finish', () => {
    if (res.statusCode === 401 && req.path.includes('auth')) {
      securityLog({
        event: 'login_failure',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        severity: 'medium',
        details: {
          endpoint: req.originalUrl,
          requestId: (extendedReq as any).requestId
        }
      });
    }

    // Log permission denied
    if (res.statusCode === 403) {
      securityLog({
        event: 'permission_denied',
        ip: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        userId: (req as any).bruker?.id,
        severity: 'medium',
        details: {
          endpoint: req.originalUrl,
          requestId: (extendedReq as any).requestId
        }
      });
    }
  });

  next();
};

// ============================================================================
// AUDIT LOGGING MIDDLEWARE
// ============================================================================

export const auditLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const extendedReq = req as RequestWithLogging;

  // Only audit certain operations
  const auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const auditPaths = ['/api/bedrifter', '/api/ansatt', '/api/elever', '/api/kontrakter'];

  if (!auditMethods.includes(req.method) || 
      !auditPaths.some(path => req.path.startsWith(path))) {
    return next();
  }

  // Capture original response to log after completion
  const originalJson = res.json;
  res.json = function(body: any) {
    // Log audit event
    auditLogDetailed({
      userId: (req as any).bruker?.id || 0,
      action: `${req.method} ${req.path}`,
      resource: extractResourceFromPath(req.path),
      resourceId: req.params.id,
      success: res.statusCode < 400,
      errorMessage: res.statusCode >= 400 ? body?.error?.message : undefined,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        requestId: (extendedReq as any).requestId,
        endpoint: req.originalUrl,
        statusCode: res.statusCode
      }
    });

    return originalJson.call(this, body);
  };

  next();
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sanitizeData(data: any, sensitiveFields: string[]): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, sensitiveFields));
  }

  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key], sensitiveFields);
    }
  }

  return sanitized;
}

function extractResourceFromPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return segments[1]; // e.g., /api/bedrifter -> bedrifter
  }
  return path;
}

// ============================================================================
// ERROR LOGGING MIDDLEWARE
// ============================================================================

export const errorLoggingMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const extendedReq = req as RequestWithLogging;
  
  // Create logger with context if not already available
  const contextLogger = extendedReq.logger || logger.withContext({
    requestId: (extendedReq as any).requestId || uuidv4(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).bruker?.id
  });

  // Log the error with full context
  contextLogger.error('Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    body: sanitizeData(req.body, ['password', 'passord', 'token']),
    query: req.query,
    params: req.params
  });

  next(error);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  loggingMiddleware,
  securityLoggingMiddleware,
  auditLoggingMiddleware,
  errorLoggingMiddleware
}; 
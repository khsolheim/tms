import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Validation Monitoring Middleware
 * Logger, sporer og varsler om validation failures og mistenkelige mønstre
 */

// In-memory cache for tracking validation failures
const validationFailureCache = new Map<string, ValidationFailureData>();
const suspiciousPatternCache = new Map<string, SuspiciousPatternData>();
const performanceMetrics = new Map<string, ValidationPerformanceData>();

interface ValidationFailureData {
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  errors: string[];
  ips: Set<string>;
  userAgents: Set<string>;
}

interface SuspiciousPatternData {
  count: number;
  pattern: string;
  firstSeen: Date;
  lastSeen: Date;
  ips: Set<string>;
  urls: Set<string>;
}

interface ValidationPerformanceData {
  totalRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  slowestRequest: number;
  lastUpdated: Date;
}

/**
 * Validation Failure Logging Middleware
 * Logger alle validation failures med detaljert informasjon
 */
export const validationFailureLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  const startTime = Date.now();

  // Override res.json to capture validation errors
  res.json = function(data: any) {
    const processingTime = Date.now() - startTime;
    
    // Check if this is a validation error response
    if (res.statusCode >= 400 && data && data.error) {
      const errorCode = data.error.code;
      const errorMessage = data.error.message;
      const requestId = (req as any).requestId;
      const ip = req.ip || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      const url = req.originalUrl;
      const method = req.method;

      // Log validation failure
      logger.warn('Validation failure detected', {
        requestId,
        errorCode,
        errorMessage,
        ip,
        userAgent,
        url,
        method,
        statusCode: res.statusCode,
        processingTime,
        body: method !== 'GET' && req.body ? JSON.stringify(req.body).substring(0, 500) : undefined,
        query: Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : undefined
      });

      // Track validation failures in memory
      trackValidationFailure(errorCode, errorMessage, ip, userAgent, url);
      
      // Update performance metrics
      updatePerformanceMetrics(url, processingTime, true);

      // Check for suspicious patterns
      checkSuspiciousPatterns(req, errorMessage);
    } else {
      // Update performance metrics for successful requests
      updatePerformanceMetrics(req.originalUrl, processingTime, false);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Track validation failures
 */
function trackValidationFailure(errorCode: string, errorMessage: string, ip: string, userAgent: string, url: string) {
  const key = `${errorCode}:${errorMessage}`;
  const existing = validationFailureCache.get(key);
  
  if (existing) {
    existing.count++;
    existing.lastSeen = new Date();
    existing.ips.add(ip);
    existing.userAgents.add(userAgent);
  } else {
    validationFailureCache.set(key, {
      count: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
      errors: [errorMessage],
      ips: new Set([ip]),
      userAgents: new Set([userAgent])
    });
  }

  // Clean up old entries (older than 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  for (const [key, data] of validationFailureCache.entries()) {
    if (data.lastSeen < twentyFourHoursAgo) {
      validationFailureCache.delete(key);
    }
  }
}

/**
 * Check for suspicious patterns
 */
function checkSuspiciousPatterns(req: Request, errorMessage: string) {
  const ip = req.ip || 'unknown';
  const url = req.originalUrl;

  // Define suspicious patterns
  const suspiciousPatterns = [
    { name: 'SQL_INJECTION', pattern: /sql|union|select|drop|insert/gi },
    { name: 'XSS_ATTEMPT', pattern: /script|javascript|onerror|onload/gi },
    { name: 'PATH_TRAVERSAL', pattern: /\.\.|\/etc\/|\/var\/|\/root\//gi },
    { name: 'COMMAND_INJECTION', pattern: /exec|eval|system|shell/gi },
    { name: 'RAPID_REQUESTS', pattern: /rate.limit|too.many/gi }
  ];

  for (const { name, pattern } of suspiciousPatterns) {
    if (pattern.test(errorMessage) || (req.body && pattern.test(JSON.stringify(req.body))) || pattern.test(url)) {
      trackSuspiciousPattern(name, ip, url);
      
      // Alert on high frequency suspicious patterns
      const patternData = suspiciousPatternCache.get(name);
      if (patternData && patternData.count > 10) {
        logger.error('High frequency suspicious pattern detected', {
          pattern: name,
          count: patternData.count,
          uniqueIPs: patternData.ips.size,
          uniqueURLs: patternData.urls.size,
          firstSeen: patternData.firstSeen,
          lastSeen: patternData.lastSeen
        });
      }
    }
  }
}

/**
 * Track suspicious patterns
 */
function trackSuspiciousPattern(pattern: string, ip: string, url: string) {
  const existing = suspiciousPatternCache.get(pattern);
  
  if (existing) {
    existing.count++;
    existing.lastSeen = new Date();
    existing.ips.add(ip);
    existing.urls.add(url);
  } else {
    suspiciousPatternCache.set(pattern, {
      count: 1,
      pattern,
      firstSeen: new Date(),
      lastSeen: new Date(),
      ips: new Set([ip]),
      urls: new Set([url])
    });
  }
}

/**
 * Update performance metrics
 */
function updatePerformanceMetrics(url: string, processingTime: number, failed: boolean) {
  const key = url.replace(/\/\d+/g, '/:id'); // Normalize URLs with IDs
  const existing = performanceMetrics.get(key);
  
  if (existing) {
    existing.totalRequests++;
    if (failed) existing.failedRequests++;
    existing.averageProcessingTime = (existing.averageProcessingTime + processingTime) / 2;
    existing.slowestRequest = Math.max(existing.slowestRequest, processingTime);
    existing.lastUpdated = new Date();
  } else {
    performanceMetrics.set(key, {
      totalRequests: 1,
      failedRequests: failed ? 1 : 0,
      averageProcessingTime: processingTime,
      slowestRequest: processingTime,
      lastUpdated: new Date()
    });
  }
}

/**
 * Get validation statistics
 */
export function getValidationStatistics() {
  const failureStats = Array.from(validationFailureCache.entries()).map(([key, data]) => ({
    errorKey: key,
    count: data.count,
    uniqueIPs: data.ips.size,
    uniqueUserAgents: data.userAgents.size,
    firstSeen: data.firstSeen,
    lastSeen: data.lastSeen
  }));

  const suspiciousStats = Array.from(suspiciousPatternCache.entries()).map(([pattern, data]) => ({
    pattern,
    count: data.count,
    uniqueIPs: data.ips.size,
    uniqueURLs: data.urls.size,
    firstSeen: data.firstSeen,
    lastSeen: data.lastSeen
  }));

  const performanceStats = Array.from(performanceMetrics.entries()).map(([url, data]) => ({
    url,
    totalRequests: data.totalRequests,
    failedRequests: data.failedRequests,
    failureRate: (data.failedRequests / data.totalRequests) * 100,
    averageProcessingTime: Math.round(data.averageProcessingTime),
    slowestRequest: data.slowestRequest,
    lastUpdated: data.lastUpdated
  }));

  return {
    validationFailures: failureStats,
    suspiciousPatterns: suspiciousStats,
    performanceMetrics: performanceStats,
    summary: {
      totalValidationFailures: failureStats.reduce((sum, stat) => sum + stat.count, 0),
      totalSuspiciousPatterns: suspiciousStats.reduce((sum, stat) => sum + stat.count, 0),
      totalRequests: performanceStats.reduce((sum, stat) => sum + stat.totalRequests, 0),
      averageFailureRate: performanceStats.length > 0 
        ? performanceStats.reduce((sum, stat) => sum + stat.failureRate, 0) / performanceStats.length 
        : 0
    }
  };
}

/**
 * Alert on suspicious patterns
 * Dette kan utvides til å sende e-post, Slack, eller andre varsler
 */
export function checkAndSendAlerts() {
  const stats = getValidationStatistics();
  
  // Alert conditions
  const alertConditions = [
    {
      condition: stats.summary.totalValidationFailures > 100,
      message: `Høy antall validation failures: ${stats.summary.totalValidationFailures}`,
      severity: 'warning'
    },
    {
      condition: stats.summary.averageFailureRate > 20,
      message: `Høy failure rate: ${stats.summary.averageFailureRate.toFixed(2)}%`,
      severity: 'error'
    },
    {
      condition: stats.suspiciousPatterns.some(p => p.count > 50),
      message: 'Mulig koordinert angrep detektert',
      severity: 'critical'
    }
  ];

  for (const alert of alertConditions) {
    if (alert.condition) {
      logger.error('Validation monitoring alert', {
        message: alert.message,
        severity: alert.severity,
        timestamp: new Date().toISOString(),
        stats: stats.summary
      });
      
      // Her kan du implementere ekstra varsling (e-post, Slack, etc.)
    }
  }
}

/**
 * Common validation error tracking middleware
 */
export const commonValidationErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Track common validation errors for analysis
    if (res.statusCode >= 400) {
      try {
        const errorData = typeof data === 'string' ? JSON.parse(data) : data;
        if (errorData && errorData.error) {
          trackCommonValidationError(errorData.error, req);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Track common validation errors
 */
function trackCommonValidationError(error: any, req: Request) {
  const errorPattern = {
    code: error.code,
    field: error.field || 'unknown',
    endpoint: req.originalUrl,
    method: req.method
  };

  logger.info('Common validation error tracked', {
    pattern: errorPattern,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
}

/**
 * Validation monitoring dashboard endpoint helper
 */
export const getValidationDashboardData = () => {
  const stats = getValidationStatistics();
  
  return {
    ...stats,
    alerts: checkAndSendAlerts(),
    lastUpdated: new Date().toISOString(),
    recommendations: generateRecommendations(stats)
  };
};

/**
 * Generate recommendations based on validation patterns
 */
function generateRecommendations(stats: any) {
  const recommendations = [];
  
  if (stats.summary.averageFailureRate > 10) {
    recommendations.push({
      type: 'validation_improvement',
      message: 'Høy validation failure rate. Vurder å forbedre input validering.',
      priority: 'medium'
    });
  }
  
  if (stats.suspiciousPatterns.length > 0) {
    recommendations.push({
      type: 'security_concern',
      message: 'Mistenkelige mønstre detektert. Vurder å skjerpe sikkerhetsvalidering.',
      priority: 'high'
    });
  }
  
  const slowEndpoints = stats.performanceMetrics.filter((m: any) => m.averageProcessingTime > 1000);
  if (slowEndpoints.length > 0) {
    recommendations.push({
      type: 'performance_optimization',
      message: `${slowEndpoints.length} endpoints har lang responstid ved validering.`,
      priority: 'medium'
    });
  }
  
  return recommendations;
}

// Schedule periodic alert checking (every 5 minutes)
setInterval(checkAndSendAlerts, 5 * 60 * 1000); 
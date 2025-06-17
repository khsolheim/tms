/**
 * API Protection Middleware
 * 
 * Komplett beskyttelse av API-endepunkter med:
 * - Rate limiting med forskjellige strategier
 * - Input validation og sanitization
 * - Security headers
 * - Threat detection og blocking
 * - Request monitoring og logging
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { rateLimitConfigs, rateLimitManager } from './rateLimiting';
import logger from '../utils/logger';
import { ValidationError, ForbiddenError } from '../utils/errors';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ProtectionConfig {
  rateLimit?: {
    enabled: boolean;
    strategy: 'strict' | 'moderate' | 'liberal' | 'adaptive';
    customConfig?: any;
  };
  inputValidation?: {
    enabled: boolean;
    maxBodySize?: number;
    maxQueryLength?: number;
    maxUrlLength?: number;
    sanitizeHtml?: boolean;
  };
  securityHeaders?: {
    enabled: boolean;
    customConfig?: any;
  };
  threatDetection?: {
    enabled: boolean;
    blockSuspiciousPatterns?: boolean;
    logOnly?: boolean;
  };
  monitoring?: {
    enabled: boolean;
    logRequests?: boolean;
    logResponses?: boolean;
  };
}

interface ThreatPattern {
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block' | 'alert';
  description: string;
}

interface RequestMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousRequests: number;
  averageResponseTime: number;
  errorRate: number;
  lastReset: number;
}

// ============================================================================
// THREAT DETECTION PATTERNS
// ============================================================================

const THREAT_PATTERNS: ThreatPattern[] = [
  // SQL Injection
  {
    name: 'SQL_INJECTION',
    pattern: /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b.*\b(from|where|into|values|table|database|schema)\b)|('.*'.*=.*')|(\b(or|and)\b.*\b(1=1|1=0)\b)/gi,
    severity: 'critical',
    action: 'block',
    description: 'SQL injection attempt detected'
  },
  
  // XSS Attempts
  {
    name: 'XSS_ATTEMPT',
    pattern: /(<script[^>]*>.*<\/script>)|(<iframe[^>]*>)|(<object[^>]*>)|(<embed[^>]*>)|(javascript:)|(on\w+\s*=)/gi,
    severity: 'high',
    action: 'block',
    description: 'Cross-site scripting attempt detected'
  },
  
  // Path Traversal
  {
    name: 'PATH_TRAVERSAL',
    pattern: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c|\.\.%2f|\.\.%5c)/gi,
    severity: 'high',
    action: 'block',
    description: 'Path traversal attempt detected'
  },
  
  // Command Injection
  {
    name: 'COMMAND_INJECTION',
    pattern: /(\b(exec|eval|system|shell_exec|passthru|popen|proc_open)\b)|(\||\&\&|\|\||\;)/gi,
    severity: 'critical',
    action: 'block',
    description: 'Command injection attempt detected'
  },
  
  // LDAP Injection
  {
    name: 'LDAP_INJECTION',
    pattern: /(\(\||\)\(|\*\)|\(\&)/gi,
    severity: 'medium',
    action: 'log',
    description: 'LDAP injection attempt detected'
  },
  
  // XML Injection
  {
    name: 'XML_INJECTION',
    pattern: /(<\?xml|<!DOCTYPE|<!ENTITY)/gi,
    severity: 'medium',
    action: 'log',
    description: 'XML injection attempt detected'
  },
  
  // NoSQL Injection
  {
    name: 'NOSQL_INJECTION',
    pattern: /(\$where|\$ne|\$gt|\$lt|\$regex|\$or|\$and)/gi,
    severity: 'high',
    action: 'block',
    description: 'NoSQL injection attempt detected'
  },
  
  // Server-Side Template Injection
  {
    name: 'SSTI_ATTEMPT',
    pattern: /(\{\{.*\}\}|\{%.*%\}|\${.*})/gi,
    severity: 'high',
    action: 'block',
    description: 'Server-side template injection attempt detected'
  },
  
  // File Inclusion
  {
    name: 'FILE_INCLUSION',
    pattern: /(\/etc\/passwd|\/etc\/shadow|\/proc\/self\/environ|\/var\/log|\/windows\/system32)/gi,
    severity: 'high',
    action: 'block',
    description: 'File inclusion attempt detected'
  },
  
  // Suspicious User Agents
  {
    name: 'SUSPICIOUS_USER_AGENT',
    pattern: /(sqlmap|nikto|nmap|masscan|zap|burp|w3af|acunetix|nessus|openvas)/gi,
    severity: 'medium',
    action: 'log',
    description: 'Suspicious user agent detected'
  }
];

// ============================================================================
// METRICS & MONITORING
// ============================================================================

class ProtectionMetrics {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    lastReset: Date.now()
  };

  private responseTimes: number[] = [];
  private errors: number = 0;
  private threatCounts = new Map<string, number>();

  updateRequest(responseTime: number, wasBlocked: boolean, wasSuspicious: boolean, hadError: boolean): void {
    this.metrics.totalRequests++;
    if (wasBlocked) this.metrics.blockedRequests++;
    if (wasSuspicious) this.metrics.suspiciousRequests++;
    if (hadError) this.errors++;

    // Track response times (keep last 1000)
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    // Calculate averages
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    this.metrics.errorRate = this.errors / this.metrics.totalRequests;

    // Reset hourly
    const now = Date.now();
    if (now - this.metrics.lastReset > 60 * 60 * 1000) {
      this.reset();
    }
  }

  updateThreat(threatName: string): void {
    const current = this.threatCounts.get(threatName) || 0;
    this.threatCounts.set(threatName, current + 1);
  }

  getMetrics(): RequestMetrics & { threats: Record<string, number> } {
    return {
      ...this.metrics,
      threats: Object.fromEntries(this.threatCounts)
    };
  }

  private reset(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      lastReset: Date.now()
    };
    this.responseTimes = [];
    this.errors = 0;
    this.threatCounts.clear();
  }
}

const protectionMetrics = new ProtectionMetrics();

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

class InputSanitizer {
  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;

    return input
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters except newline and tab
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize unicode
      .normalize('NFC')
      // Trim whitespace
      .trim();
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Remove HTML tags (basic sanitization)
   */
  static stripHtml(input: string): string {
    if (typeof input !== 'string') return input;
    return input.replace(/<[^>]*>/g, '');
  }
}

// ============================================================================
// THREAT DETECTION
// ============================================================================

class ThreatDetector {
  /**
   * Analyze request for threats
   */
  static analyzeRequest(req: Request): {
    threats: Array<{ pattern: ThreatPattern; matches: string[] }>;
    riskScore: number;
    shouldBlock: boolean;
  } {
    const threats: Array<{ pattern: ThreatPattern; matches: string[] }> = [];
    let riskScore = 0;

    // Combine all request data for analysis
    const requestData = JSON.stringify({
      url: req.originalUrl,
      query: req.query,
      body: req.body,
      headers: req.headers,
      userAgent: req.get('User-Agent')
    });

    // Check each threat pattern
    for (const pattern of THREAT_PATTERNS) {
      const matches = requestData.match(pattern.pattern);
      if (matches) {
        threats.push({ pattern, matches });
        protectionMetrics.updateThreat(pattern.name);

        // Calculate risk score
        const severityScore = {
          low: 1,
          medium: 3,
          high: 7,
          critical: 10
        }[pattern.severity];

        riskScore += severityScore * matches.length;
      }
    }

    // Determine if request should be blocked
    const shouldBlock = threats.some(t => t.pattern.action === 'block') || riskScore > 15;

    return { threats, riskScore, shouldBlock };
  }

  /**
   * Log threat detection
   */
  static logThreats(req: Request, threats: Array<{ pattern: ThreatPattern; matches: string[] }>, riskScore: number): void {
    if (threats.length === 0) return;

    const threatDetails = threats.map(t => ({
      name: t.pattern.name,
      severity: t.pattern.severity,
      description: t.pattern.description,
      matches: t.matches.length,
      action: t.pattern.action
    }));

    logger.warn('Security threats detected', {
      requestId: (req as any).requestId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      riskScore,
      threats: threatDetails,
      userId: (req as any).bruker?.id
    });
  }
}

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

const securityHeadersConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frame Options
  frameguard: { action: 'deny' },
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross Domain Policies
  permittedCrossDomainPolicies: false,
  
  // Referrer Policy
  referrerPolicy: { policy: ["no-referrer", "strict-origin-when-cross-origin"] },
  
  // X-XSS-Protection
  xssFilter: true,
});

// ============================================================================
// MAIN PROTECTION MIDDLEWARE
// ============================================================================

export const createApiProtection = (config: ProtectionConfig = {}) => {
  const {
    rateLimit = { enabled: true, strategy: 'moderate' },
    inputValidation = { enabled: true, maxBodySize: 10 * 1024 * 1024, maxQueryLength: 2048, maxUrlLength: 2048 },
    securityHeaders = { enabled: true },
    threatDetection = { enabled: true, blockSuspiciousPatterns: true, logOnly: false },
    monitoring = { enabled: true, logRequests: true, logResponses: false }
  } = config;

  return [
    // Security headers first
    ...(securityHeaders.enabled ? [securityHeadersConfig] : []),

    // Main protection middleware
    async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      let wasBlocked = false;
      let wasSuspicious = false;
      let hadError = false;

      try {
        // Input validation
        if (inputValidation.enabled) {
          // Check URL length
          if (req.originalUrl.length > (inputValidation.maxUrlLength || 2048)) {
            logger.warn('Oversized URL blocked', {
              requestId: (req as any).requestId,
              ip: req.ip,
              urlLength: req.originalUrl.length,
              maxAllowed: inputValidation.maxUrlLength
            });
            wasBlocked = true;
            throw new ValidationError('URL er for lang');
          }

          // Check query length
          const queryString = JSON.stringify(req.query);
          if (queryString.length > (inputValidation.maxQueryLength || 2048)) {
            logger.warn('Oversized query blocked', {
              requestId: (req as any).requestId,
              ip: req.ip,
              queryLength: queryString.length,
              maxAllowed: inputValidation.maxQueryLength
            });
            wasBlocked = true;
            throw new ValidationError('Query parametere er for lange');
          }

          // Sanitize input
          if (req.body) {
            req.body = InputSanitizer.sanitizeObject(req.body);
          }
          if (req.query) {
            req.query = InputSanitizer.sanitizeObject(req.query);
          }
          if (req.params) {
            req.params = InputSanitizer.sanitizeObject(req.params);
          }
        }

        // Threat detection
        if (threatDetection.enabled) {
          const analysis = ThreatDetector.analyzeRequest(req);
          
          if (analysis.threats.length > 0) {
            wasSuspicious = true;
            ThreatDetector.logThreats(req, analysis.threats, analysis.riskScore);

            if (analysis.shouldBlock && !threatDetection.logOnly) {
              wasBlocked = true;
              logger.error('Request blocked due to security threats', {
                requestId: (req as any).requestId,
                ip: req.ip,
                riskScore: analysis.riskScore,
                threatCount: analysis.threats.length
              });
              throw new ForbiddenError('Forespørsel blokkert på grunn av sikkerhetstrusler');
            }
          }
        }

        // Request logging
        if (monitoring.enabled && monitoring.logRequests) {
          logger.info('API request', {
            requestId: (req as any).requestId,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: (req as any).bruker?.id,
            contentLength: req.get('Content-Length'),
            riskScore: wasSuspicious ? 'detected' : 'clean'
          });
        }

        // Response monitoring
        res.on('finish', () => {
          const responseTime = Date.now() - startTime;
          hadError = res.statusCode >= 400;

          protectionMetrics.updateRequest(responseTime, wasBlocked, wasSuspicious, hadError);

          if (monitoring.enabled && monitoring.logResponses) {
            logger.info('API response', {
              requestId: (req as any).requestId,
              statusCode: res.statusCode,
              responseTime,
              contentLength: res.get('Content-Length')
            });
          }
        });

        next();

      } catch (error) {
        hadError = true;
        const responseTime = Date.now() - startTime;
        protectionMetrics.updateRequest(responseTime, wasBlocked, wasSuspicious, hadError);
        next(error);
      }
    },

    // Rate limiting (applied after input validation)
    ...(rateLimit.enabled ? [getRateLimitMiddleware(rateLimit.strategy, rateLimit.customConfig)] : [])
  ];
};

// ============================================================================
// RATE LIMIT STRATEGY SELECTOR
// ============================================================================

function getRateLimitMiddleware(strategy: string, customConfig?: any) {
  switch (strategy) {
    case 'strict':
      return rateLimitConfigs.strict;
    case 'liberal':
      return rateLimitConfigs.api;
    case 'adaptive':
      return rateLimitConfigs.login; // Uses adaptive config
    case 'moderate':
    default:
      return rateLimitConfigs.perUser;
  }
}

// ============================================================================
// PREDEFINED PROTECTION PROFILES
// ============================================================================

export const protectionProfiles = {
  // Maximum security for sensitive endpoints
  maximum: createApiProtection({
    rateLimit: { enabled: true, strategy: 'strict' },
    inputValidation: { enabled: true, maxBodySize: 1024 * 1024, maxQueryLength: 512, maxUrlLength: 1024 },
    securityHeaders: { enabled: true },
    threatDetection: { enabled: true, blockSuspiciousPatterns: true, logOnly: false },
    monitoring: { enabled: true, logRequests: true, logResponses: true }
  }),

  // High security for authentication endpoints
  authentication: createApiProtection({
    rateLimit: { enabled: true, strategy: 'adaptive' },
    inputValidation: { enabled: true, maxBodySize: 10 * 1024, maxQueryLength: 256, maxUrlLength: 512 },
    securityHeaders: { enabled: true },
    threatDetection: { enabled: true, blockSuspiciousPatterns: true, logOnly: false },
    monitoring: { enabled: true, logRequests: true, logResponses: false }
  }),

  // Standard security for API endpoints
  standard: createApiProtection({
    rateLimit: { enabled: true, strategy: 'moderate' },
    inputValidation: { enabled: true },
    securityHeaders: { enabled: true },
    threatDetection: { enabled: true, blockSuspiciousPatterns: true, logOnly: false },
    monitoring: { enabled: true, logRequests: false, logResponses: false }
  }),

  // Light security for public endpoints
  public: createApiProtection({
    rateLimit: { enabled: true, strategy: 'liberal' },
    inputValidation: { enabled: true, maxBodySize: 100 * 1024 },
    securityHeaders: { enabled: true },
    threatDetection: { enabled: true, blockSuspiciousPatterns: false, logOnly: true },
    monitoring: { enabled: false }
  }),

  // Development profile (logging only)
  development: {
    enabled: false,
    strategy: "liberal" as const
  }
};

// ============================================================================
// MANAGEMENT & MONITORING
// ============================================================================

export const protectionManager = {
  // Get protection metrics
  getMetrics: () => protectionMetrics.getMetrics(),

  // Get rate limit statistics
  getRateLimitStats: () => rateLimitManager.getStats(),

  // Reset all protection metrics
  resetMetrics: () => {
    protectionMetrics['reset']();
    logger.info('Protection metrics reset');
  },

  // IP management
  whitelist: rateLimitManager.whitelist,
  blacklist: rateLimitManager.blacklist,

  // Threat patterns management
  getThreatPatterns: () => THREAT_PATTERNS,
  
  // Test threat detection
  testThreatDetection: (input: string) => {
    const mockReq = {
      originalUrl: '/test',
      query: {},
      body: { test: input },
      headers: {},
      get: () => 'test-agent'
    } as any;
    
    return ThreatDetector.analyzeRequest(mockReq);
  }
};

export default {
  createApiProtection,
  protectionProfiles,
  protectionManager,
  InputSanitizer,
  ThreatDetector
}; 
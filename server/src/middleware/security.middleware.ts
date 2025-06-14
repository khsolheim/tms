/**
 * Security Middleware
 * 
 * Comprehensive security protection med helmet, rate limiting,
 * input validation og audit logging
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

/**
 * Helmet configuration for security headers
 */
export const securityHeaders = helmet({
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
  crossOriginEmbedderPolicy: false, // Tillat embedding av ressurser
  
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
// RATE LIMITING CONFIGURATION
// ============================================================================

/**
 * General API rate limiting
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 1000, // Maksimalt 1000 requests per vindun
  message: {
    error: 'For mange forespørsler fra denne IP-adressen, prøv igjen senere.',
    retryAfter: '15 minutter',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === '/health' || req.url === '/api/health';
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit reached:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });
    res.status(429).json({
      error: 'For mange forespørsler fra denne IP-adressen, prøv igjen senere.',
      retryAfter: '15 minutter',
    });
  },
});

/**
 * Strict rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 5, // Maksimalt 5 login forsøk per vindun
  message: {
    error: 'For mange innloggingsforsøk, prøv igjen om 15 minutter.',
    retryAfter: '15 minutter',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Ikke tell vellykkede forsøk
  handler: (req: Request, res: Response) => {
    logger.error('Auth rate limit reached:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: { ...req.body, password: '[REDACTED]' },
    });
    res.status(429).json({
      error: 'For mange innloggingsforsøk, prøv igjen om 15 minutter.',
      retryAfter: '15 minutter',
    });
  },
});

/**
 * Moderate rate limiting for data modification
 */
export const modificationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutter
  max: 50, // Maksimalt 50 modifications per vindun
  message: {
    error: 'For mange endringer fra denne IP-adressen, prøv igjen senere.',
    retryAfter: '5 minutter',
  },
  skip: (req) => req.method === 'GET', // Kun for POST, PUT, DELETE
});

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

/**
 * Validation for Norwegian personal numbers
 */
const norwegianPersonalNumber = (value: string): boolean => {
  // Basic format check: 11 digits
  if (!/^\d{11}$/.test(value)) return false;
  
  // Simple validation - in production you'd want more sophisticated validation
  const day = parseInt(value.substring(0, 2));
  const month = parseInt(value.substring(2, 4));
  const year = parseInt(value.substring(4, 6));
  
  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
};

/**
 * Validation for Norwegian organization numbers
 */
const norwegianOrganizationNumber = (value: string): boolean => {
  // Must be 9 digits
  if (!/^\d{9}$/.test(value)) return false;
  
  // MOD11 validation for organization numbers
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(value[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === parseInt(value[8]);
};

// ============================================================================
// VALIDATION MIDDLEWARE FACTORIES
// ============================================================================

/**
 * User input validation
 */
export const validateUserInput = [
  body('fornavn')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-ZæøåÆØÅ\s\-']+$/)
    .withMessage('Fornavn må være 1-50 tegn og kun inneholde bokstaver'),
  
  body('etternavn')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-ZæøåÆØÅ\s\-']+$/)
    .withMessage('Etternavn må være 1-50 tegn og kun inneholde bokstaver'),
  
  body('epost')
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Ugyldig e-postadresse'),
  
  body('telefon')
    .optional()
    .trim()
    .matches(/^(\+47)?[0-9\s]{8,15}$/)
    .withMessage('Ugyldig telefonnummer'),
  
  body('personnummer')
    .optional()
    .trim()
    .custom(norwegianPersonalNumber)
    .withMessage('Ugyldig norsk personnummer'),
];

/**
 * Company input validation
 */
export const validateCompanyInput = [
  body('navn')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-ZæøåÆØÅ0-9\s\-&.,()]+$/)
    .withMessage('Bedriftsnavn må være 1-100 tegn'),
  
  body('organisasjonsnummer')
    .trim()
    .custom(norwegianOrganizationNumber)
    .withMessage('Ugyldig norsk organisasjonsnummer'),
  
  body('epost')
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Ugyldig e-postadresse'),
  
  body('telefon')
    .optional()
    .trim()
    .matches(/^(\+47)?[0-9\s]{8,15}$/)
    .withMessage('Ugyldig telefonnummer'),
  
  body('adresse')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Adresse kan ikke være lengre enn 200 tegn'),
  
  body('postnummer')
    .optional()
    .trim()
    .matches(/^[0-9]{4}$/)
    .withMessage('Postnummer må være 4 siffer'),
  
  body('poststed')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .matches(/^[a-zA-ZæøåÆØÅ\s\-]+$/)
    .withMessage('Ugyldig poststed'),
];

/**
 * Contract input validation
 */
export const validateContractInput = [
  body('beskrivelse')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Beskrivelse må være mellom 10 og 1000 tegn'),
  
  body('startDato')
    .isISO8601()
    .toDate()
    .withMessage('Ugyldig startdato'),
  
  body('sluttDato')
    .isISO8601()
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDato)) {
        throw new Error('Sluttdato må være etter startdato');
      }
      return true;
    }),
  
  body('totalPris')
    .isFloat({ min: 0, max: 10000000 })
    .withMessage('Total pris må være mellom 0 og 10 millioner'),
  
  body('bedriftId')
    .isInt({ min: 1 })
    .withMessage('Ugyldig bedrift ID'),
];

/**
 * Authentication validation
 */
export const validateAuthInput = [
  body('epost')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Ugyldig e-postadresse'),
  
  body('passord')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Passord må være minst 8 tegn og inneholde store og små bokstaver, tall og spesialtegn'),
];

/**
 * Query parameter validation
 */
export const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Side må være mellom 1 og 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Grense må være mellom 1 og 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .matches(/^[a-zA-ZæøåÆØÅ0-9\s\-_.@]+$/)
    .withMessage('Søk kan kun inneholde bokstaver, tall og vanlige tegn'),
];

/**
 * ID parameter validation
 */
export const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID må være et positivt heltall'),
];

// ============================================================================
// VALIDATION ERROR HANDLER
// ============================================================================

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', {
      errors: errors.array(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });
    
    return res.status(400).json({
      error: 'Validering feilet',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      })),
    });
  }
  
  next();
};

// ============================================================================
// AUDIT LOGGING MIDDLEWARE
// ============================================================================

/**
 * Audit logging for sensitive operations
 */
export const auditLog = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log the operation attempt
    const auditData = {
      operation,
      userId: (req as any).user?.id || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      body: req.method !== 'GET' ? { ...req.body, password: '[REDACTED]' } : undefined,
    };
    
    logger.info('Audit log:', auditData);
    
    // Override response to log the result
    const originalJson = res.json;
    res.json = function(data: any) {
      const resultAuditData = {
        ...auditData,
        statusCode: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 300,
        completedAt: new Date().toISOString(),
      };
      
      if (res.statusCode >= 400) {
        logger.error('Audit log - Operation failed:', resultAuditData);
      } else {
        logger.info('Audit log - Operation completed:', resultAuditData);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Sanitize user input to prevent injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove null bytes
  const removeNullBytes = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/\0/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = removeNullBytes(obj[key]);
      }
    }
    return obj;
  };
  
  if (req.body) req.body = removeNullBytes(req.body);
  if (req.query) req.query = removeNullBytes(req.query);
  if (req.params) req.params = removeNullBytes(req.params);
  
  next();
};

/**
 * Request size limiter
 */
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeInMB = parseInt(maxSize.replace('mb', ''));
      
      if (sizeInMB > maxSizeInMB) {
        logger.warn('Request size limit exceeded:', {
          size: `${sizeInMB.toFixed(2)}MB`,
          limit: maxSize,
          ip: req.ip,
          url: req.url,
        });
        
        return res.status(413).json({
          error: 'Forespørsel for stor',
          maxSize,
        });
      }
    }
    
    next();
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  securityHeaders,
  apiRateLimit,
  authRateLimit,
  modificationRateLimit,
  validateUserInput,
  validateCompanyInput,
  validateContractInput,
  validateAuthInput,
  validateQueryParams,
  validateIdParam,
  handleValidationErrors,
  auditLog,
  sanitizeInput,
  requestSizeLimit,
}; 
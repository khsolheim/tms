/**
 * Security Configuration
 * 
 * Centralisert konfigurasjon for alle sikkerhet-relaterte innstillinger
 * med environment variables og reasonable fallbacks
 */

import { config } from 'dotenv';

// Load environment variables
config();

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'super-secret-jwt-key-minimum-32-characters-long-for-security',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: 'tms-api',
  audience: 'tms-client',
};

// ============================================================================
// PASSWORD POLICY CONFIGURATION
// ============================================================================

export const PASSWORD_POLICY = {
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
  requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
  requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
  maxAge: parseInt(process.env.PASSWORD_MAX_AGE_DAYS || '90'), // dager
  preventReuse: parseInt(process.env.PASSWORD_PREVENT_REUSE || '5'), // antall tidligere passord
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  
  // Common weak passwords to prevent
  weakPasswords: [
    'password', 'passord', '12345678', 'qwerty123', 
    'admin123', 'test1234', 'password123', 'passord123',
    '123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm123'
  ],
};

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

export const RATE_LIMITS = {
  // General API rate limiting
  api: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    skipPaths: ['/health', '/api/health'],
  },
  
  // Authentication endpoints (strict)
  auth: {
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutter
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
    skipSuccessfulRequests: true,
  },
  
  // Data modification endpoints
  modification: {
    windowMs: parseInt(process.env.MOD_RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutter
    max: parseInt(process.env.MOD_RATE_LIMIT_MAX || '50'),
    skipMethods: ['GET'],
  },
  
  // File upload endpoints
  upload: {
    windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '60000'), // 1 minutt
    max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '10'),
  },
};

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

export const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "blob:"
      ],
      scriptSrc: [
        "'self'",
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      reportUri: process.env.CSP_REPORT_URI || undefined,
    },
  },
  
  hsts: {
    maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'), // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  crossOriginResourcePolicy: { 
    policy: process.env.CORP_POLICY || "cross-origin" 
  },
  
  referrerPolicy: { 
    policy: ["no-referrer", "strict-origin-when-cross-origin"] 
  },
};

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : false)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Cache'],
  maxAge: 86400, // 24 hours
};

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

export const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET || 'change-this-session-secret',
  name: 'tms.sid',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000'), // 7 dager
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
};

// ============================================================================
// VALIDATION CONFIGURATION
// ============================================================================

export const VALIDATION_CONFIG = {
  // Request size limits
  maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  
  // Allowed file types
  allowedMimeTypes: (process.env.ALLOWED_FILE_TYPES || 
    'image/jpeg,image/png,application/pdf,text/csv,text/plain').split(','),
  
  // Input validation
  maxStringLength: parseInt(process.env.MAX_STRING_LENGTH || '1000'),
  maxArrayLength: parseInt(process.env.MAX_ARRAY_LENGTH || '100'),
  
  // Norwegian specific validation
  enableNorwegianValidation: process.env.ENABLE_NORWEGIAN_VALIDATION !== 'false',
};

// ============================================================================
// AUDIT LOGGING CONFIGURATION
// ============================================================================

export const AUDIT_CONFIG = {
  enabled: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  logLevel: process.env.AUDIT_LOG_LEVEL || 'info',
  logFile: process.env.AUDIT_LOG_FILE || 'logs/audit.log',
  
  // What to log
  logSuccessfulAuth: true,
  logFailedAuth: true,
  logDataChanges: true,
  logPrivilegedActions: true,
  logFileUploads: true,
  
  // Retention
  retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '365'),
};

// ============================================================================
// MONITORING CONFIGURATION
// ============================================================================

export const MONITORING_CONFIG = {
  enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
  enableSecurityMonitoring: process.env.ENABLE_SECURITY_MONITORING !== 'false',
  
  // Alert thresholds
  failedLoginThreshold: parseInt(process.env.FAILED_LOGIN_ALERT_THRESHOLD || '10'),
  suspiciousPatternThreshold: parseInt(process.env.SUSPICIOUS_PATTERN_THRESHOLD || '5'),
  
  // Performance thresholds
  slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'), // ms
  highMemoryThreshold: parseInt(process.env.HIGH_MEMORY_THRESHOLD || '80'), // %
};

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'tms:',
  },
  
  // Cache TTLs (in seconds)
  ttl: {
    default: parseInt(process.env.CACHE_TTL_DEFAULT || '300'), // 5 minutter
    user: parseInt(process.env.CACHE_TTL_USER || '900'), // 15 minutter
    session: parseInt(process.env.CACHE_TTL_SESSION || '604800'), // 7 dager
    blacklist: parseInt(process.env.CACHE_TTL_BLACKLIST || '86400'), // 24 timer
    failedAttempts: parseInt(process.env.CACHE_TTL_FAILED_ATTEMPTS || '900'), // 15 minutter
  },
};

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

export const validateSecurityConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate JWT secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
      errors.push('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }
    
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      errors.push('SESSION_SECRET must be at least 32 characters in production');
    }
    
    if (!process.env.FRONTEND_URL) {
      errors.push('FRONTEND_URL must be set in production');
    }
  }
  
  // Validate database URL
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }
  
  // Validate bcrypt rounds
  if (PASSWORD_POLICY.bcryptRounds < 10 || PASSWORD_POLICY.bcryptRounds > 15) {
    errors.push('BCRYPT_ROUNDS should be between 10 and 15 for security vs performance');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  enableHelmet: process.env.ENABLE_HELMET !== 'false',
  enableCors: process.env.ENABLE_CORS !== 'false',
  enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
  enableInputValidation: process.env.ENABLE_INPUT_VALIDATION !== 'false',
  enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
  
  // Development features
  enableApiDocs: process.env.ENABLE_API_DOCS === 'true',
  enableDebugLogging: process.env.ENABLE_DEBUG_LOGGING === 'true',
};

// ============================================================================
// EXPORT COMBINED CONFIG
// ============================================================================

export const SECURITY_CONFIG = {
  jwt: JWT_CONFIG,
  password: PASSWORD_POLICY,
  rateLimits: RATE_LIMITS,
  headers: SECURITY_HEADERS,
  cors: CORS_CONFIG,
  session: SESSION_CONFIG,
  validation: VALIDATION_CONFIG,
  audit: AUDIT_CONFIG,
  monitoring: MONITORING_CONFIG,
  cache: CACHE_CONFIG,
  features: FEATURE_FLAGS,
};

export default SECURITY_CONFIG; 
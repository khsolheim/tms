import { z } from 'zod';
import logger from '../utils/logger';

// Definer schema for miljøvariabler
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL er pakrevd'),
  DATABASE_MAX_CONNECTIONS: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_MIN_CONNECTIONS: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_CONNECTION_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_IDLE_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_MAX_LIFETIME: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_QUERY_TIMEOUT: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_RETRY_DELAY: z.string().regex(/^\d+$/).transform(Number).optional(),
  DATABASE_SLOW_QUERY_THRESHOLD: z.string().regex(/^\d+$/).transform(Number).optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET må være minst 32 tegn'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Server
  PORT: z.string().regex(/^\d+$/, 'PORT må være et tall').default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // CORS
  CORS_ORIGIN: z.string().optional(),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).default('900000'), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).default('100'),
  
  // Email (valgfritt)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // External APIs (valgfritt)
  BRONNØYSUND_API_KEY: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs'),
  
  // Security
  BCRYPT_ROUNDS: z.string().regex(/^\d+$/).default('12'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET må være minst 32 tegn').optional(),
  
  // File uploads
  MAX_FILE_SIZE: z.string().regex(/^\d+$/).default('10485760'), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Cache
  REDIS_URL: z.string().optional(),
  CACHE_TTL: z.string().regex(/^\d+$/).default('300'), // 5 min
});

// Type for validerte miljøvariabler
export type Environment = z.infer<typeof envSchema>;

// Validerte miljøvariabler (singleton)
let validatedEnv: Environment | null = null;

/**
 * Valider og returner miljøvariabler
 * Kaster feil hvis validering feiler
 */
export function validateEnvironment(): Environment {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    // Parse og valider miljøvariabler
    validatedEnv = envSchema.parse(process.env);
    
    logger.info('Environment validation successful', {
      nodeEnv: validatedEnv.NODE_ENV,
      port: validatedEnv.PORT,
      logLevel: validatedEnv.LOG_LEVEL,
      hasDatabase: !!validatedEnv.DATABASE_URL,
      hasJwtSecret: !!validatedEnv.JWT_SECRET,
      hasSmtp: !!(validatedEnv.SMTP_HOST && validatedEnv.SMTP_USER),
      hasBronnøysund: !!validatedEnv.BRONNØYSUND_API_KEY,
      hasRedis: !!validatedEnv.REDIS_URL
    });
    
    return validatedEnv;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      logger.error('Environment validation failed', {
        missingVariables: missingVars,
        availableVars: Object.keys(process.env).filter(key => 
          !key.includes('PASSWORD') && !key.includes('SECRET') && !key.includes('KEY')
        )
      });
      
      console.error('\n❌ ENVIRONMENT VALIDATION FAILED:');
      console.error('Missing or invalid environment variables:');
      missingVars.forEach(msg => console.error(`  - ${msg}`));
      console.error('\nPlease check your .env file or environment configuration.\n');
      
      process.exit(1);
    }
    
    throw error;
  }
}

/**
 * Hent validerte miljøvariabler (må kalles etter validateEnvironment)
 */
export function getEnvironment(): Environment {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnvironment() first.');
  }
  return validatedEnv;
}

/**
 * Sjekk om vi er i produksjon
 */
export function isProduction(): boolean {
  return getEnvironment().NODE_ENV === 'production';
}

/**
 * Sjekk om vi er i development
 */
export function isDevelopment(): boolean {
  return getEnvironment().NODE_ENV === 'development';
}

/**
 * Sjekk om vi er i test-modus
 */
export function isTest(): boolean {
  return getEnvironment().NODE_ENV === 'test';
}

/**
 * Hent port som nummer
 */
export function getPort(): number {
  return parseInt(getEnvironment().PORT, 10);
}

/**
 * Hent bcrypt rounds som nummer
 */
export function getBcryptRounds(): number {
  return parseInt(getEnvironment().BCRYPT_ROUNDS, 10);
}

/**
 * Hent max file size som nummer
 */
export function getMaxFileSize(): number {
  return parseInt(getEnvironment().MAX_FILE_SIZE, 10);
}

/**
 * Hent cache TTL som nummer
 */
export function getCacheTTL(): number {
  return parseInt(getEnvironment().CACHE_TTL, 10);
}

/**
 * Hent rate limit konfigurasjon
 */
export function getRateLimitConfig() {
  const env = getEnvironment();
  return {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10)
  };
} 
import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import { getEnvironment } from '../config/environment';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
  files?: {
    maxSize?: number;
    allowedTypes?: string[];
    maxCount?: number;
    required?: boolean;
  };
}

interface ValidationOptions {
  stripUnknown?: boolean;
  abortEarly?: boolean;
  allowUnknown?: boolean;
  skipOnError?: boolean;
}

interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

// Norske personnummer (11 siffer)
export const personnummerSchema = z.string()
  .regex(/^\d{11}$/, 'Personnummer må være 11 siffer')
  .refine((value) => {
    // Enkel modulo 11-kontroll
    const weights = [3, 7, 6, 1, 8, 9, 4, 5, 2, 1];
    const digits = value.split('').map(Number);
    const checksum = digits.slice(0, 10).reduce((sum, digit, index) => 
      sum + digit * weights[index], 0
    );
    const controlDigit = (11 - (checksum % 11)) % 11;
    return controlDigit === digits[10];
  }, 'Ugyldig personnummer');

// Norske organisasjonsnummer (9 siffer)
export const organisasjonsnummerSchema = z.string()
  .regex(/^\d{9}$/, 'Organisasjonsnummer må være 9 siffer')
  .refine((value) => {
    // Modulo 11-kontroll for organisasjonsnummer
    const weights = [3, 2, 7, 6, 5, 4, 3, 2];
    const digits = value.split('').map(Number);
    const checksum = digits.slice(0, 8).reduce((sum, digit, index) => 
      sum + digit * weights[index], 0
    );
    const remainder = checksum % 11;
    const controlDigit = remainder === 0 ? 0 : 11 - remainder;
    return controlDigit === digits[8];
  }, 'Ugyldig organisasjonsnummer');

// Norske telefonnummer
export const telefonSchema = z.string()
  .regex(/^(\+47|0047|47)?[2-9]\d{7}$/, 'Ugyldig norsk telefonnummer')
  .transform(value => value.replace(/^(\+47|0047|47)/, ''));

// Norske postnummer
export const postnummerSchema = z.string()
  .regex(/^\d{4}$/, 'Postnummer må være 4 siffer')
  .refine((value) => {
    const num = parseInt(value);
    return num >= 1 && num <= 9999;
  }, 'Ugyldig postnummer');

// E-post validering
export const epostSchema = z.string()
  .email('Ugyldig e-postadresse')
  .max(254, 'E-postadresse kan ikke være lengre enn 254 tegn')
  .toLowerCase();

// Passord validering
export const passordSchema = z.string()
  .min(8, 'Passord må være minst 8 tegn')
  .max(128, 'Passord kan ikke være lengre enn 128 tegn')
  .regex(/[A-Z]/, 'Passord må inneholde minst én stor bokstav')
  .regex(/[a-z]/, 'Passord må inneholde minst én liten bokstav')
  .regex(/\d/, 'Passord må inneholde minst ett tall')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Passord må inneholde minst ett spesialtegn');

// Dato validering
export const datoSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Dato må være i format YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === value;
  }, 'Ugyldig dato');

// ID validering
export const idSchema = z.union([
  z.string().regex(/^\d+$/).transform(Number),
  z.number().int().positive()
], { errorMap: () => ({ message: 'ID må være et positivt heltall' }) });

// Paginering
export const pagineringSchema = z.object({
  side: z.string().regex(/^\d+$/).transform(Number).default('1'),
  grense: z.string().regex(/^\d+$/).transform(Number).default('10')
    .refine(val => val <= 100, 'Maksimalt 100 elementer per side'),
  sortering: z.string().optional(),
  retning: z.enum(['asc', 'desc']).default('asc')
});

// Søk
export const sokSchema = z.object({
  q: z.string().min(1, 'Søketerm kan ikke være tom').max(100, 'Søketerm kan ikke være lengre enn 100 tegn'),
  felt: z.array(z.string()).optional(),
  filter: z.record(z.string()).optional()
});

// ============================================================================
// VALIDATION MIDDLEWARE FACTORY
// ============================================================================

/**
 * Opprett validation middleware for spesifikke schemas
 */
export function validateRequest(schemas: ValidationSchemas, options: ValidationOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: ValidationError[] = [];
      const env = getEnvironment();

      // Valider body
      if (schemas.body && req.body) {
        const result = await validateSchema(schemas.body, req.body, 'body', options);
        if (!result.success) {
          errors.push(...result.errors!);
        } else {
          req.body = result.data;
        }
      }

      // Valider query parameters
      if (schemas.query && req.query) {
        const result = await validateSchema(schemas.query, req.query, 'query', options);
        if (!result.success) {
          errors.push(...result.errors!);
        } else {
          req.query = result.data;
        }
      }

      // Valider URL parameters
      if (schemas.params && req.params) {
        const result = await validateSchema(schemas.params, req.params, 'params', options);
        if (!result.success) {
          errors.push(...result.errors!);
        } else {
          req.params = result.data;
        }
      }

      // Valider headers
      if (schemas.headers) {
        const result = await validateSchema(schemas.headers, req.headers, 'headers', options);
        if (!result.success) {
          errors.push(...result.errors!);
        }
      }

      // Valider filer
      if (schemas.files && req.files) {
        const fileErrors = validateFiles(req.files, schemas.files, env);
        errors.push(...fileErrors);
      }

      // Hvis det er feil, kast validation error
      if (errors.length > 0) {
        logger.warn('Request validation failed', {
          url: req.url,
          method: req.method,
          errors: errors.map(e => ({ field: e.field, message: e.message, code: e.code })),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });

        throw ApiError.validation('Valideringsfeil i forespørsel', 'VALIDATION_ERROR', errors);
      }

      // Log successful validation i development
      if (env.NODE_ENV === 'development') {
        logger.debug('Request validation successful', {
          url: req.url,
          method: req.method,
          hasBody: !!req.body,
          hasQuery: Object.keys(req.query).length > 0,
          hasParams: Object.keys(req.params).length > 0
        });
      }

      next();

    } catch (error) {
      next(error);
    }
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valider data mot Zod schema
 */
async function validateSchema(
  schema: ZodSchema, 
  data: any, 
  context: string, 
  options: ValidationOptions
): Promise<ValidationResult> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: `${context}.${err.path.join('.')}`,
        message: err.message,
        code: err.code,
        value: 'received' in err ? err.received : undefined
      }));
      return { success: false, errors };
    }
    throw error;
  }
}

/**
 * Valider opplastede filer
 */
function validateFiles(files: any, config: NonNullable<ValidationSchemas['files']>, env: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileArray = Array.isArray(files) ? files : Object.values(files).flat();

  // Sjekk om filer er pakrevd
  if (config.required && fileArray.length === 0) {
    errors.push({
      field: 'files',
      message: 'Minst én fil må lastes opp',
      code: 'required'
    });
    return errors;
  }

  // Sjekk antall filer
  if (config.maxCount && fileArray.length > config.maxCount) {
    errors.push({
      field: 'files',
      message: `Maksimalt ${config.maxCount} filer tillatt`,
      code: 'too_many_files',
      value: fileArray.length
    });
  }

  // Valider hver fil
  fileArray.forEach((file: any, index: number) => {
    // Sjekk filstørrelse
    const maxSize = config.maxSize || parseInt(env.MAX_FILE_SIZE);
    if (file.size > maxSize) {
      errors.push({
        field: `files[${index}].size`,
        message: `Fil er for stor. Maksimalt ${Math.round(maxSize / 1024 / 1024)}MB tillatt`,
        code: 'file_too_large',
        value: file.size
      });
    }

    // Sjekk filtype
    if (config.allowedTypes && !config.allowedTypes.includes(file.mimetype)) {
      errors.push({
        field: `files[${index}].type`,
        message: `Filtype ${file.mimetype} er ikke tillatt`,
        code: 'invalid_file_type',
        value: file.mimetype
      });
    }

    // Sjekk filnavn
    if (file.originalname && !/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
      errors.push({
        field: `files[${index}].name`,
        message: 'Filnavn kan kun inneholde bokstaver, tall, punktum, bindestrek og understrek',
        code: 'invalid_filename',
        value: file.originalname
      });
    }
  });

  return errors;
}

// ============================================================================
// SPECIALIZED VALIDATION MIDDLEWARE
// ============================================================================

/**
 * Valider paginering i query parameters
 */
export const validatePagination = validateRequest({
  query: pagineringSchema
});

/**
 * Valider søk i query parameters
 */
export const validateSearch = validateRequest({
  query: sokSchema
});

/**
 * Valider ID i URL parameter
 */
export const validateId = validateRequest({
  params: z.object({ id: idSchema })
});

/**
 * Valider organisasjonsnummer i URL parameter
 */
export const validateOrgNummer = validateRequest({
  params: z.object({ orgNummer: organisasjonsnummerSchema })
});

/**
 * Valider fil-upload
 */
export const validateFileUpload = (options: NonNullable<ValidationSchemas['files']> = {}) => 
  validateRequest({ files: options });

/**
 * Valider JSON Content-Type
 */
export const validateJsonContentType = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw ApiError.badRequest('Content-Type må være application/json');
    }
  }
  next();
};

/**
 * Valider request størrelse
 */
export const validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('Content-Length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      throw ApiError.badRequest(`Forespørsel er for stor. Maksimalt ${Math.round(maxSize / 1024 / 1024)}MB tillatt`);
    }
    next();
  };
};

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitiser strenger for XSS
 */
export function sanitizeString(value: string): string {
  return value
    .replace(/[<>]/g, '') // Fjern HTML tags
    .replace(/javascript:/gi, '') // Fjern javascript: URLs
    .replace(/on\w+=/gi, '') // Fjern event handlers
    .trim();
}

/**
 * Sanitiser objekt rekursivt
 */
export function sanitizeObject(obj: any): any {
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
}

/**
 * Middleware for å sanitisere request data
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
}; 
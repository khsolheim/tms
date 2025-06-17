import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

// Type for validation middleware
export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('DEBUGGING VALIDATION - Input:', {
        body: req.body,
        query: req.query,
        params: req.params,
        url: req.url
      });
      
      // Valider request data
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      console.log('DEBUGGING VALIDATION - Success:', validatedData);

      // Oppdater req objektet med validerte data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      console.log('DEBUGGING VALIDATION - Error:', error);
      
      if (error instanceof ZodError) {
        console.log('DEBUGGING VALIDATION - Zod Errors:', error.errors);
        
        // Format Zod errors til lesbar format
        const formattedErrors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });

        console.log('DEBUGGING VALIDATION - Formatted Errors:', formattedErrors);

        // Send 400 response directly instead of throwing
        return res.status(400).json({
          error: 'Valideringsfeil i forespørselen',
          details: formattedErrors
        });
      }
      
      // Hvis det ikke er en Zod error, pass den videre
      next(error);
    }
  };
};

// Hjelpefunksjon for å lage optional schema (for PATCH/PUT requests)
export const makeOptional = <T extends z.ZodTypeAny>(schema: T) => {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const newShape: any = {};
    
    for (const key in shape) {
      newShape[key] = shape[key].optional();
    }
    
    return z.object(newShape);
  }
  
  return schema.optional();
};

// Hjelpefunksjon for å validere norske personnummer
export const validatePersonnummer = (pnr: string): boolean => {
  if (!/^\d{11}$/.test(pnr)) return false;
  
  const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
  const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  const digits = pnr.split('').map(Number);
  
  // Sjekk første kontrollsiffer
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += digits[i] * weights1[i];
  }
  const checkDigit1 = 11 - (sum1 % 11);
  if (checkDigit1 === 11) {
    if (digits[9] !== 0) return false;
  } else if (checkDigit1 === 10) {
    return false; // Ugyldig personnummer
  } else if (digits[9] !== checkDigit1) {
    return false;
  }
  
  // Sjekk andre kontrollsiffer
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {
    sum2 += digits[i] * weights2[i];
  }
  const checkDigit2 = 11 - (sum2 % 11);
  if (checkDigit2 === 11) {
    return digits[10] === 0;
  } else if (checkDigit2 === 10) {
    return false; // Ugyldig personnummer
  } else {
    return digits[10] === checkDigit2;
  }
};

// Hjelpefunksjon for å validere norske organisasjonsnummer
export const validateOrganisasjonsnummer = (orgnr: string): boolean => {
  if (!/^\d{9}$/.test(orgnr)) return false;
  
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  const digits = orgnr.split('').map(Number);
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return digits[8] === checkDigit;
};

// Hjelpefunksjon for å validere norske kontonummer
export const validateKontonummer = (kontonr: string): boolean => {
  // Fjern mellomrom og punktum
  const cleanKontonr = kontonr.replace(/[\s.]/g, '');
  
  if (!/^\d{11}$/.test(cleanKontonr)) return false;
  
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = cleanKontonr.split('').map(Number);
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return digits[10] === checkDigit;
};

// Custom Zod validators for norske formater
export const norwegianValidators = {
  personnummer: z.string()
    .regex(/^\d{11}$/, "Personnummer må være 11 siffer")
    .refine(validatePersonnummer, "Ugyldig personnummer"),
    
  organisasjonsnummer: z.string()
    .regex(/^\d{9}$/, "Organisasjonsnummer må være 9 siffer")
    .refine(validateOrganisasjonsnummer, "Ugyldig organisasjonsnummer"),
    
  kontonummer: z.string()
    .transform(val => val.replace(/[\s.]/g, ''))
    .pipe(
      z.string()
        .regex(/^\d{11}$/, "Kontonummer må være 11 siffer")
        .refine(validateKontonummer, "Ugyldig kontonummer")
    ),
    
  postnummer: z.string()
    .regex(/^\d{4}$/, "Postnummer må være 4 siffer"),
    
  telefonnummer: z.string()
    .regex(
      /^(\+47)?[\s]?(\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}|\d{3}[\s]?\d{2}[\s]?\d{3}|\d{8})$/,
      "Ugyldig telefonnummer format"
    )
}; 
import { z } from 'zod';
import { norwegianValidators } from './norwegian-validators';

// Custom Zod validators for norske formater
export const customZodValidators = {
  // Personnummer validator
  personnummer: () => 
    z.string()
      .regex(/^\d{11}$/, "Personnummer må være 11 siffer")
      .refine(norwegianValidators.personnummer, "Ugyldig personnummer"),

  // Organisasjonsnummer validator
  organisasjonsnummer: () =>
    z.string()
      .regex(/^\d{9}$/, "Organisasjonsnummer må være 9 siffer")
      .refine(norwegianValidators.organisasjonsnummer, "Ugyldig organisasjonsnummer"),

  // Kontonummer validator med formatering
  kontonummer: () =>
    z.string()
      .transform(val => val.replace(/[\s.]/g, ''))
      .pipe(
        z.string()
          .regex(/^\d{11}$/, "Kontonummer må være 11 siffer")
          .refine(norwegianValidators.kontonummer, "Ugyldig kontonummer")
      ),

  // Postnummer validator
  postnummer: () =>
    z.string()
      .regex(/^\d{4}$/, "Postnummer må være 4 siffer")
      .refine(norwegianValidators.postnummer, "Ugyldig postnummer"),

  // Telefonnummer validator
  telefonnummer: () =>
    z.string()
      .refine(norwegianValidators.telefonnummer, "Ugyldig telefonnummer format"),

  // KID-nummer validator
  kidNummer: () =>
    z.string()
      .refine(norwegianValidators.kidNummer, "Ugyldig KID-nummer"),

  // Alder validatorer
  minimumAge: (minAge: number) =>
    z.string()
      .refine(
        (pnr) => {
          const age = norwegianValidators.getAgeFromPersonnummer(pnr);
          return age !== null && age >= minAge;
        },
        `Person må være minst ${minAge} år gammel`
      ),

  maximumAge: (maxAge: number) =>
    z.string()
      .refine(
        (pnr) => {
          const age = norwegianValidators.getAgeFromPersonnummer(pnr);
          return age !== null && age <= maxAge;
        },
        `Person kan ikke være eldre enn ${maxAge} år`
      ),

  // Myndig validator
  adult: () =>
    z.string()
      .refine(
        norwegianValidators.isAdult,
        "Person må være myndig (18 år eller eldre)"
      ),
};

// Validation error formattering
export interface ValidationErrorDetails {
  field: string;
  message: string;
  value?: any;
  code?: string;
}

export class ValidationErrorFormatter {
  /**
   * Formaterer Zod feil til brukervennlig format
   */
  static formatZodErrors(errors: z.ZodError): ValidationErrorDetails[] {
    return errors.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code
    }));
  }

  /**
   * Formaterer server validation errors
   */
  static formatServerErrors(errors: Record<string, string[]>): ValidationErrorDetails[] {
    const result: ValidationErrorDetails[] = [];
    
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        result.push({
          field,
          message,
          code: 'server_validation_error'
        });
      });
    });
    
    return result;
  }

  /**
   * Grupperer feil per felt
   */
  static groupErrorsByField(errors: ValidationErrorDetails[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    
    errors.forEach(error => {
      if (!grouped[error.field]) {
        grouped[error.field] = [];
      }
      grouped[error.field].push(error.message);
    });
    
    return grouped;
  }

  /**
   * Henter første feil for et felt
   */
  static getFirstErrorForField(errors: ValidationErrorDetails[], fieldName: string): string | undefined {
    const fieldError = errors.find(error => error.field === fieldName);
    return fieldError?.message;
  }

  /**
   * Sjekker om et spesifikt felt har feil
   */
  static hasFieldError(errors: ValidationErrorDetails[], fieldName: string): boolean {
    return errors.some(error => error.field === fieldName);
  }
}

// Validation helpers
export class ValidationHelpers {
  /**
   * Debounce funksjon for async validering
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle funksjon for performance
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Kombinerer sync og async validering
   */
  static async validateField<T>(
    value: T,
    syncValidator?: (value: T) => boolean | string,
    asyncValidator?: (value: T) => Promise<boolean | string>
  ): Promise<string | true> {
    // Kjør sync validering først
    if (syncValidator) {
      const syncResult = syncValidator(value);
      if (syncResult !== true) {
        return typeof syncResult === 'string' ? syncResult : 'Valideringsfeil';
      }
    }

    // Kjør async validering hvis sync passerte
    if (asyncValidator) {
      const asyncResult = await asyncValidator(value);
      if (asyncResult !== true) {
        return typeof asyncResult === 'string' ? asyncResult : 'Valideringsfeil';
      }
    }

    return true;
  }

  /**
   * Validerer multiple felter parallelt
   */
  static async validateFields(
    validators: Array<() => Promise<boolean | string>>
  ): Promise<(string | true)[]> {
    const results = await Promise.all(validators.map(validator => validator()));
    return results.map(result => result === false ? 'Valideringsfeil' : result);
  }

  /**
   * Sjekker om alle valideringer er OK
   */
  static allValid(results: (string | true)[]): boolean {
    return results.every(result => result === true);
  }

  /**
   * Henter alle feilmeldinger fra validering
   */
  static getErrors(results: (string | true)[]): string[] {
    return results.filter((result): result is string => result !== true);
  }
}

// Spesialiserte validators for TMS-systemet
export const tmsValidators = {
  /**
   * Validerer at elev er gammel nok for førerkort
   */
  validDriverAge: () =>
    customZodValidators.personnummer()
      .refine(
        (pnr) => {
          const age = norwegianValidators.getAgeFromPersonnummer(pnr);
          return age !== null && age >= 16;
        },
        "Eleven må være minst 16 år for å ta førerkort"
      ),

  /**
   * Validerer at fakturaansvarlig er myndig
   */
  validBillingResponsible: () =>
    customZodValidators.personnummer()
      .refine(
        norwegianValidators.isAdult,
        "Fakturaansvarlig må være myndig (18 år eller eldre)"
      ),

  /**
   * Validerer lånebeløp for kontrakt
   */
  validLoanAmount: () =>
    z.number()
      .min(1000, "Lånebeløp må være minst 1000 kr")
      .max(1000000, "Lånebeløp kan ikke overstige 1 000 000 kr"),

  /**
   * Validerer løpetid for kontrakt
   */
  validLoanPeriod: () =>
    z.number()
      .refine(
        val => [12, 24, 36].includes(val),
        "Løpetid må være 12, 24 eller 36 måneder"
      ),

  /**
   * Validerer rente
   */
  validInterestRate: () =>
    z.number()
      .min(0, "Rente kan ikke være negativ")
      .max(50, "Rente kan ikke overstige 50%"),

  /**
   * Validerer at to personnummer er forskjellige
   */
  differentPersons: (otherPersonnummer: string) =>
    customZodValidators.personnummer()
      .refine(
        (pnr) => pnr !== otherPersonnummer,
        "Personnummer kan ikke være det samme som for eleven"
      ),

  /**
   * Validerer status overgang
   */
  validStatusTransition: (fromStatus: string) => {
    const validTransitions: Record<string, string[]> = {
      'UTKAST': ['GODKJENT', 'KANSELLERT'],
      'GODKJENT': ['SIGNERT', 'KANSELLERT'],
      'SIGNERT': ['AKTIV', 'KANSELLERT'],
      'AKTIV': ['AVSLUTTET', 'KANSELLERT'],
      'AVSLUTTET': [],
      'KANSELLERT': []
    };

    return z.string().refine(
      (toStatus) => validTransitions[fromStatus]?.includes(toStatus) || false,
      `Ugyldig statusovergang fra ${fromStatus}`
    );
  }
};

// Export alle validators samlet
export const validators = {
  norwegian: norwegianValidators,
  custom: customZodValidators,
  tms: tmsValidators,
  helpers: ValidationHelpers,
  formatter: ValidationErrorFormatter
}; 
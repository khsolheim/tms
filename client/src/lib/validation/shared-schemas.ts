import { z } from 'zod';

// Norske validators
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

// Validerings hjelpefunksjoner
export function validatePersonnummer(pnr: string): boolean {
  if (!/^\d{11}$/.test(pnr)) return false;
  
  const digits = pnr.split('').map(Number);
  const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
  const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  // Kontrollsiffer 1
  const sum1 = digits.slice(0, 9).reduce((sum, digit, i) => sum + digit * weights1[i], 0);
  const checkDigit1 = (11 - (sum1 % 11)) % 11;
  if (checkDigit1 === 10 || checkDigit1 !== digits[9]) return false;
  
  // Kontrollsiffer 2
  const sum2 = digits.slice(0, 10).reduce((sum, digit, i) => sum + digit * weights2[i], 0);
  const checkDigit2 = (11 - (sum2 % 11)) % 11;
  if (checkDigit2 === 10 || checkDigit2 !== digits[10]) return false;
  
  return true;
}

export function validateOrganisasjonsnummer(orgnr: string): boolean {
  if (!/^\d{9}$/.test(orgnr)) return false;
  
  const digits = orgnr.split('').map(Number);
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];
  
  const sum = digits.slice(0, 8).reduce((sum, digit, i) => sum + digit * weights[i], 0);
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return checkDigit === digits[8];
}

export function validateKontonummer(kontonr: string): boolean {
  if (!/^\d{11}$/.test(kontonr)) return false;
  
  const digits = kontonr.split('').map(Number);
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  const sum = digits.slice(0, 10).reduce((sum, digit, i) => sum + digit * weights[i], 0);
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;
  
  return checkDigit === digits[10];
}

// Basis person schema
export const personSchema = z.object({
  fornavn: z.string()
    .min(2, "Fornavn må være minst 2 tegn")
    .max(50, "Fornavn kan ikke være lengre enn 50 tegn")
    .trim(),
  etternavn: z.string()
    .min(2, "Etternavn må være minst 2 tegn")
    .max(50, "Etternavn kan ikke være lengre enn 50 tegn")
    .trim(),
  personnummer: norwegianValidators.personnummer,
  telefon: norwegianValidators.telefonnummer,
  epost: z.string()
    .email("Ugyldig e-postadresse")
    .toLowerCase()
    .trim(),
  gate: z.string()
    .min(1, "Gateadresse er påkrevd")
    .max(200, "Gateadresse kan ikke være lengre enn 200 tegn")
    .trim(),
  postnr: norwegianValidators.postnummer,
  poststed: z.string()
    .min(1, "Poststed er påkrevd")
    .max(100, "Poststed kan ikke være lengre enn 100 tegn")
    .trim()
});

// Avanserte business rule validators
export const businessRuleValidators = {
  // Kontrakt totalsum limits
  kontraktTotalsum: z.number()
    .min(1000, "Total lånebeløp må være minst 1000 kr")
    .max(1000000, "Total lånebeløp kan ikke overstige 1 000 000 kr"),
    
  // Aldersgrense sjekk for elever (minimum 16 år, maksimum 100 år)
  elevAlder: z.string()
    .refine(validateElevAlder, "Elev må være mellom 16 og 100 år"),
    
  // Datovalidering (ikke bakover i tid for visse felt)
  futureDate: z.date()
    .refine(date => date >= new Date(), "Dato kan ikke være i fortiden"),
    
  // Status-overgang validering
  statusTransition: z.object({
    fromStatus: z.string(),
    toStatus: z.string()
  }).refine(validateStatusTransition, "Ugyldig statusovergang"),
    
  // Duplikat-sjekk helper (til bruk med async validering)
  uniqueEmail: z.string()
    .email("Ugyldig e-postadresse")
    .toLowerCase()
    .trim(),
    
  uniquePersonnummer: norwegianValidators.personnummer,
};

// Business rule hjelpefunksjoner
export function validateElevAlder(personnummer: string): boolean {
  if (!validatePersonnummer(personnummer)) return false;
  
  const day = parseInt(personnummer.substring(0, 2));
  const month = parseInt(personnummer.substring(2, 4));
  let year = parseInt(personnummer.substring(4, 6));
  
  // Håndter århundre basert på individnummer
  const individNummer = parseInt(personnummer.substring(6, 9));
  if (individNummer >= 0 && individNummer <= 499) {
    year += 1900;
  } else if (individNummer >= 500 && individNummer <= 999) {
    year += 2000;
  }
  
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 16 && age - 1 <= 100;
  }
  
  return age >= 16 && age <= 100;
}

export function validateStatusTransition(transition: { fromStatus: string; toStatus: string }): boolean {
  const validTransitions: Record<string, string[]> = {
    'UTKAST': ['GODKJENT', 'KANSELLERT'],
    'GODKJENT': ['SIGNERT', 'KANSELLERT'],
    'SIGNERT': ['AKTIV', 'KANSELLERT'],
    'AKTIV': ['AVSLUTTET', 'KANSELLERT'],
    'AVSLUTTET': [], // Ingen overganger fra avsluttet
    'KANSELLERT': [] // Ingen overganger fra kansellert
  };
  
  return validTransitions[transition.fromStatus]?.includes(transition.toStatus) || false;
  }

// Basis kontrakt schema uten .refine() for å kunne utvide
const baseKontraktSchema = z.object({
  // Elev info
  elevFornavn: personSchema.shape.fornavn,
  elevEtternavn: personSchema.shape.etternavn,
  elevPersonnummer: personSchema.shape.personnummer,
  elevTelefon: personSchema.shape.telefon,
  elevEpost: personSchema.shape.epost,
  elevGate: personSchema.shape.gate,
  elevPostnr: personSchema.shape.postnr,
  elevPoststed: personSchema.shape.poststed,
  
  // Fakturaansvarlig (valgfri)
  harFakturaansvarlig: z.boolean(),
  fakturaansvarligFornavn: personSchema.shape.fornavn.optional(),
  fakturaansvarligEtternavn: personSchema.shape.etternavn.optional(),
  fakturaansvarligPersonnummer: personSchema.shape.personnummer.optional(),
  fakturaansvarligTelefon: personSchema.shape.telefon.optional(),
  fakturaansvarligEpost: personSchema.shape.epost.optional(),
  fakturaansvarligGate: personSchema.shape.gate.optional(),
  fakturaansvarligPostnr: personSchema.shape.postnr.optional(),
  fakturaansvarligPoststed: personSchema.shape.poststed.optional(),
  
  // Låneinformasjon
  lan: z.number()
    .min(1000, "Lånebeløp må være minst 1000 kr")
    .max(1000000, "Lånebeløp kan ikke overstige 1 000 000 kr"),
  lopetid: z.number()
    .refine(val => [12, 24, 36].includes(val), {
      message: "Løpetid må være 12, 24 eller 36 måneder"
    }),
  rente: z.number()
    .min(0, "Rente kan ikke være negativ")
    .max(50, "Rente kan ikke overstige 50%"),
  etableringsgebyr: z.number()
    .min(0, "Etableringsgebyr kan ikke være negativt")
    .max(10000, "Etableringsgebyr kan ikke overstige 10 000 kr"),
  termingebyr: z.number()
    .min(0, "Termingebyr kan ikke være negativt")
    .max(500, "Termingebyr kan ikke overstige 500 kr"),
  terminerPerAr: z.number()
    .min(1)
    .max(12)
    .default(12),
  inkludererGebyrerILan: z.boolean()
    .default(false),
  
  // Beregnede verdier (read-only)
  effektivRente: z.number(),
  renterOgGebyr: z.number(),
  terminbelop: z.number(),
  totalRente: z.number(),
  totalBelop: z.number()
});

// Kontrakt schema (eksportert for bakoverkompatibilitet)
export const kontraktSchema = baseKontraktSchema.refine((data: z.infer<typeof baseKontraktSchema>) => {
  // Hvis fakturaansvarlig er aktivert, må alle fakturaansvarlig-felt være utfylt
  if (data.harFakturaansvarlig) {
    return !!(
      data.fakturaansvarligFornavn &&
      data.fakturaansvarligEtternavn &&
      data.fakturaansvarligPersonnummer &&
      data.fakturaansvarligTelefon &&
      data.fakturaansvarligEpost &&
      data.fakturaansvarligGate &&
      data.fakturaansvarligPostnr &&
      data.fakturaansvarligPoststed
    );
  }
  return true;
}, {
  message: "Alle fakturaansvarlig-felt må fylles ut når fakturaansvarlig er aktivert",
  path: ["harFakturaansvarlig"]
});

// Utvidet kontrakt schema med business rules
export const kontraktSchemaWithBusinessRules = baseKontraktSchema.extend({
  // Overstyr med business rule validering
  lan: businessRuleValidators.kontraktTotalsum,
  elevPersonnummer: businessRuleValidators.elevAlder,
}).refine((data: z.infer<typeof baseKontraktSchema>) => {
  // Cross-field validering: Totalbeløp må være realistisk
  const totalMedRenter = data.lan + (data.lan * (data.rente / 100) * (data.lopetid / 12));
  if (totalMedRenter > 2000000) {
    return false;
  }
  return true;
}, {
  message: "Totalbeløp med renter kan ikke overstige 2 000 000 kr",
  path: ["lan"]
}).refine((data: z.infer<typeof baseKontraktSchema>) => {
  // Terminbeløp må være rimelig
  const terminbelopPerManed = data.terminbelop;
  if (terminbelopPerManed < 100 || terminbelopPerManed > 50000) {
    return false;
  }
  return true;
}, {
  message: "Terminbeløp må være mellom 100 og 50 000 kr per måned",
  path: ["terminbelop"]
});

// Conditional validering for fakturaansvarlig
export const kontraktSchemaWithConditional = kontraktSchemaWithBusinessRules.refine((data: z.infer<typeof baseKontraktSchema>) => {
  if (data.harFakturaansvarlig) {
    // Fakturaansvarlig kan ikke være samme person som elev
    if (data.fakturaansvarligPersonnummer === data.elevPersonnummer) {
      return false;
    }
    
    // Fakturaansvarlig må være myndig (over 18 år)
    if (data.fakturaansvarligPersonnummer && !validatePersonOverAge(data.fakturaansvarligPersonnummer, 18)) {
      return false;
    }
  }
  return true;
}, {
  message: "Fakturaansvarlig må være en annen person enn eleven og være myndig (over 18 år)",
  path: ["fakturaansvarligPersonnummer"]
});

export function validatePersonOverAge(personnummer: string, minAge: number): boolean {
  if (!validatePersonnummer(personnummer)) return false;
  
  const day = parseInt(personnummer.substring(0, 2));
  const month = parseInt(personnummer.substring(2, 4));
  let year = parseInt(personnummer.substring(4, 6));
  
  const individNummer = parseInt(personnummer.substring(6, 9));
  if (individNummer >= 0 && individNummer <= 499) {
    year += 1900;
  } else if (individNummer >= 500 && individNummer <= 999) {
    year += 2000;
  }
  
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
}

// Async validering schemas (for unikhet sjekker)
export const asyncValidationSchemas = {
  uniqueEmailCheck: z.object({
    email: z.string().email(),
    excludeId: z.number().optional()
  }),
  
  uniquePersonnummerCheck: z.object({
    personnummer: norwegianValidators.personnummer,
    excludeId: z.number().optional()
  }),
  
  uniqueOrganisasjonsnummerCheck: z.object({
    organisasjonsnummer: norwegianValidators.organisasjonsnummer,
    excludeId: z.number().optional()
  })
};

// Ansatt schemas
export const ansattRegistrerSchema = z.object({
  fornavn: personSchema.shape.fornavn,
  etternavn: personSchema.shape.etternavn,
  epost: personSchema.shape.epost,
  passord: z.string()
    .min(8, "Passord må være minst 8 tegn")
    .max(100, "Passord kan ikke være lengre enn 100 tegn")
    .regex(/(?=.*[a-z])/, "Passord må inneholde minst én liten bokstav")
    .regex(/(?=.*[A-Z])/, "Passord må inneholde minst én stor bokstav")
    .regex(/(?=.*\d)/, "Passord må inneholde minst ett tall")
    .regex(/(?=.*[@$!%*?&])/, "Passord må inneholde minst ett spesialtegn (@$!%*?&)"),
  bekreftPassord: z.string(),
  bedriftId: z.number()
    .positive("Bedrift ID må være et positivt tall")
}).refine((data) => data.passord === data.bekreftPassord, {
  message: "Passordene stemmer ikke overens",
  path: ["bekreftPassord"]
});

export const ansattInnloggingSchema = z.object({
  epost: personSchema.shape.epost,
  passord: z.string()
    .min(1, "Passord er påkrevd")
});

// Elev schemas
export const elevRegistrerSchema = z.object({
  ...personSchema.shape,
  klassekode: z.string()
    .min(1, "Klassekode er påkrevd")
    .max(10, "Klassekode kan ikke være lengre enn 10 tegn")
    .trim(),
  bedriftId: z.number()
    .positive("Bedrift ID må være et positivt tall")
    .optional()
});

// Bedrift schemas
export const bedriftSchema = z.object({
  navn: z.string()
    .min(2, "Bedriftsnavn må være minst 2 tegn")
    .max(100, "Bedriftsnavn kan ikke være lengre enn 100 tegn")
    .trim(),
  orgNummer: norwegianValidators.organisasjonsnummer.optional(),
  adresse: z.string()
    .max(200, "Adresse kan ikke være lengre enn 200 tegn")
    .optional(),
  postnummer: norwegianValidators.postnummer.optional(),
  poststed: z.string()
    .max(100, "Poststed kan ikke være lengre enn 100 tegn")
    .optional(),
  telefon: norwegianValidators.telefonnummer.optional(),
  epost: z.string()
    .email("Ugyldig e-postadresse")
    .optional()
    .or(z.literal(""))
});

// Type exports
export type KontraktFormData = z.infer<typeof kontraktSchema>;
export type AnsattRegistrerFormData = z.infer<typeof ansattRegistrerSchema>;
export type AnsattInnloggingFormData = z.infer<typeof ansattInnloggingSchema>;
export type ElevRegistrerFormData = z.infer<typeof elevRegistrerSchema>;
export type BedriftFormData = z.infer<typeof bedriftSchema>;
export type PersonFormData = z.infer<typeof personSchema>; 
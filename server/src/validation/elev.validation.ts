import { z } from 'zod';
import { validatePersonnummer, norwegianValidators } from '../middleware/validation';

// Schema for å opprette elev
export const createElevSchema = z.object({
  body: z.object({
    personnummer: norwegianValidators.personnummer,
    fornavn: z.string()
      .min(2, "Fornavn må være minst 2 tegn")
      .max(50, "Fornavn kan ikke være lengre enn 50 tegn")
      .trim(),
    etternavn: z.string()
      .min(2, "Etternavn må være minst 2 tegn")
      .max(50, "Etternavn kan ikke være lengre enn 50 tegn")
      .trim(),
    epost: z.string()
      .email("Ugyldig e-postadresse")
      .toLowerCase()
      .trim(),
    telefon: norwegianValidators.telefonnummer,
    gate: z.string()
      .min(1, "Gate/adresse er påkrevd")
      .max(200, "Gate/adresse kan ikke være lengre enn 200 tegn")
      .trim(),
    postnummer: norwegianValidators.postnummer,
    poststed: z.string()
      .min(1, "Poststed er påkrevd")
      .max(100, "Poststed kan ikke være lengre enn 100 tegn")
      .trim(),
    klassekode: z.string()
      .min(1, "Klassekode er påkrevd")
      .max(10, "Klassekode kan ikke være lengre enn 10 tegn")
      .trim(),
    bedriftId: z.number({
      required_error: "Bedrift ID er påkrevd",
      invalid_type_error: "Bedrift ID må være et tall"
    }).positive("Bedrift ID må være et positivt tall").optional()
  })
});

// Schema for å oppdatere elev
export const updateElevSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    fornavn: z.string()
      .min(2, "Fornavn må være minst 2 tegn")
      .max(50, "Fornavn kan ikke være lengre enn 50 tegn")
      .trim()
      .optional(),
    etternavn: z.string()
      .min(2, "Etternavn må være minst 2 tegn")
      .max(50, "Etternavn kan ikke være lengre enn 50 tegn")
      .trim()
      .optional(),
    epost: z.string()
      .email("Ugyldig e-postadresse")
      .toLowerCase()
      .trim()
      .optional(),
    telefon: norwegianValidators.telefonnummer.optional(),
    gate: z.string()
      .min(1, "Gate/adresse er påkrevd")
      .max(200, "Gate/adresse kan ikke være lengre enn 200 tegn")
      .trim()
      .optional(),
    postnummer: norwegianValidators.postnummer.optional(),
    poststed: z.string()
      .min(1, "Poststed er påkrevd")
      .max(100, "Poststed kan ikke være lengre enn 100 tegn")
      .trim()
      .optional(),
    klassekode: z.string()
      .min(1, "Klassekode er påkrevd")
      .max(10, "Klassekode kan ikke være lengre enn 10 tegn")
      .trim()
      .optional()
  })
});

// Schema for elevsøknad
export const createElevSoknadSchema = z.object({
  body: z.object({
    personnummer: norwegianValidators.personnummer,
    fornavn: z.string()
      .min(2, "Fornavn må være minst 2 tegn")
      .max(50, "Fornavn kan ikke være lengre enn 50 tegn")
      .trim(),
    etternavn: z.string()
      .min(2, "Etternavn må være minst 2 tegn")
      .max(50, "Etternavn kan ikke være lengre enn 50 tegn")
      .trim(),
    epost: z.string()
      .email("Ugyldig e-postadresse")
      .toLowerCase()
      .trim(),
    telefon: norwegianValidators.telefonnummer.optional(),
    adresse: z.string()
      .max(200, "Adresse kan ikke være lengre enn 200 tegn")
      .optional(),
    postnummer: norwegianValidators.postnummer.optional(),
    poststed: z.string()
      .max(100, "Poststed kan ikke være lengre enn 100 tegn")
      .optional(),
    merknad: z.string()
      .max(500, "Merknad kan ikke være lengre enn 500 tegn")
      .optional(),
    bedriftId: z.number({
      required_error: "Bedrift ID er påkrevd",
      invalid_type_error: "Bedrift ID må være et tall"
    }).positive("Bedrift ID må være et positivt tall")
  })
});

// Schema for å godkjenne/avvise elevsøknad
export const handleElevSoknadSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    action: z.enum(['godkjenn', 'avvis'], {
      errorMap: () => ({ message: "Action må være 'godkjenn' eller 'avvis'" })
    }),
    merknad: z.string()
      .max(500, "Merknad kan ikke være lengre enn 500 tegn")
      .optional()
  })
});

// Schema for søk
export const searchElevSchema = z.object({
  query: z.object({
    sokeord: z.string()
      .min(1, "Søkeord er påkrevd")
      .max(100, "Søkeord kan ikke være lengre enn 100 tegn")
      .trim()
  })
});

// Schema for sletting
export const deleteElevSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å hente elev by personnummer
export const getElevByPersonnummerSchema = z.object({
  params: z.object({
    personnummer: norwegianValidators.personnummer
  })
});

// Schema for å hente elev med ID
export const getElevByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å hente elever for bedrift
export const getEleverByBedriftSchema = z.object({
  params: z.object({
    bedriftId: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number)
  })
}); 
import { z } from 'zod';
import { 
  organisasjonsnummerSchema, 
  epostSchema, 
  telefonSchema, 
  postnummerSchema,
  idSchema 
} from '../middleware/requestValidation';

// Hjelpefunksjoner for norske validatorer
const organisasjonsnummerRegex = /^\d{9}$/;
const postnummerRegex = /^\d{4}$/;
const telefonRegex = /^(\+47)?[\s]?(\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}|\d{3}[\s]?\d{2}[\s]?\d{3}|\d{8})$/;

// Schema for å opprette bedrift
export const createBedriftSchema = z.object({
  body: z.object({
    navn: z.string()
      .min(2, "Bedriftsnavn må være minst 2 tegn")
      .max(100, "Bedriftsnavn kan ikke være lengre enn 100 tegn")
      .trim(),
    organisasjonsnummer: z.string()
      .optional()
      .default("")
      .transform(val => {
        const trimmed = val?.trim() || "";
        return trimmed; // Organisasjonsnummer kan være tom streng
      })
      .refine(val => val === "" || organisasjonsnummerRegex.test(val), {
        message: "Organisasjonsnummer må være 9 siffer"
      }),
    adresse: z.string()
      .max(200, "Adresse kan ikke være lengre enn 200 tegn")
      .optional(),
    postnummer: z.string()
      .optional()
      .transform(val => {
        const trimmed = val?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : null;
      })
      .refine(val => val === null || postnummerRegex.test(val), {
        message: "Postnummer må være 4 siffer"
      }),
    poststed: z.string()
      .max(100, "Poststed kan ikke være lengre enn 100 tegn")
      .optional(),
    telefon: z.string()
      .optional()
      .transform(val => {
        const trimmed = val?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : null;
      })
      .refine(val => val === null || telefonRegex.test(val), {
        message: "Ugyldig telefonnummer format"
      }),
    epost: z.string()
      .optional()
      .transform(val => {
        const trimmed = val?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : null;
      })
      .refine(val => val === null || z.string().email().safeParse(val).success, {
        message: "Ugyldig e-postadresse"
      }),
    // Utvidet informasjon fra Brønnøysundregisteret
    stiftelsesdato: z.union([
      z.string().datetime(),
      z.string().date(),
      z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Ugyldig datoformat"
      })
    ]).optional().nullable(),
    organisasjonsform: z.string().optional().nullable(),
    organisasjonsformKode: z.string().optional().nullable(),
    naeringskode: z.string().optional().nullable(),
    naeringskodeKode: z.string().optional().nullable(),
    dagligLeder: z.union([
      z.string(),
      z.object({
        fornavn: z.string().optional(),
        etternavn: z.string().optional(),
        fulltNavn: z.string().optional(),
        beskrivelse: z.string().optional(),
        sistEndret: z.string().optional()
      }),
      z.null()
    ]).optional().nullable(),
    styreleder: z.union([
      z.string(),
      z.object({
        fornavn: z.string().optional(),
        etternavn: z.string().optional(),
        fulltNavn: z.string().optional(),
        beskrivelse: z.string().optional(),
        sistEndret: z.string().optional()
      }),
      z.null()
    ]).optional().nullable(),
    signaturrett: z.array(z.union([
      z.string(),
      z.object({
        fornavn: z.string().optional(),
        etternavn: z.string().optional(),
        fulltNavn: z.string().optional(),
        beskrivelse: z.string().optional()
      })
    ])).optional().default([]),
    brregMetadata: z.any().optional().nullable()
  })
});

// Schema for å oppdatere bedrift
export const updateBedriftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: createBedriftSchema.shape.body.partial()
});

// Schema for å sette hovedbruker
export const setHovedbrukerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    hovedbrukerId: z.number({
      required_error: "Hovedbruker ID er pakrevd",
      invalid_type_error: "Hovedbruker ID må være et tall"
    }).positive("Hovedbruker ID må være et positivt tall")
  })
});

// Schema for å legge til klasser
export const addKlasserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    klasser: z.array(
      z.string()
        .min(1, "Klassekode kan ikke være tom")
        .max(10, "Klassekode kan ikke være lengre enn 10 tegn")
    )
    .min(1, "Minst én klasse må velges")
    .max(20, "Maksimalt 20 klasser kan legges til")
  })
});

// Schema for å opprette ansatt
export const createAnsattSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
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
    passord: z.string()
      .min(8, "Passord må være minst 8 tegn")
      .max(100, "Passord kan ikke være lengre enn 100 tegn")
      .regex(/(?=.*[a-z])/, "Passord må inneholde minst én liten bokstav")
      .regex(/(?=.*[A-Z])/, "Passord må inneholde minst én stor bokstav")
      .regex(/(?=.*\d)/, "Passord må inneholde minst ett tall"),
    rolle: z.enum(['ADMIN', 'TRAFIKKLARER', 'SENSOR']).optional().default('TRAFIKKLARER')
  })
});

// Schema for kjoretoy
const kjoretoyBaseSchema = z.object({
  registreringsnummer: z.string()
    .toUpperCase()
    .regex(/^[A-Z]{2}\d{5}$/, "Registreringsnummer må være 2 bokstaver + 5 tall (f.eks. AB12345)")
    .trim(),
  merke: z.string()
    .min(2, "Merke må være minst 2 tegn")
    .max(50, "Merke kan ikke være lengre enn 50 tegn")
    .trim(),
  modell: z.string()
    .min(1, "Modell må være minst 1 tegn")
    .max(50, "Modell kan ikke være lengre enn 50 tegn")
    .trim(),
  aarsmodell: z.number()
    .min(1900, "Årsmodell må være 1900 eller nyere")
    .max(new Date().getFullYear() + 1, "Årsmodell kan ikke være i fremtiden"),
  type: z.enum(['Personbil', 'Motorsykkel', 'Lastebil', 'Buss', 'Traktor']),
  status: z.enum(['AKTIV', 'INAKTIV', 'SERVICE', 'SOLGT']),
  forerkortklass: z.array(
    z.string()
      .min(1, "Førerkortklasse kan ikke være tom")
      .max(5, "Førerkortklasse kan ikke være lengre enn 5 tegn")
  ).min(1, "Minst én førerkortklasse må velges")
});

// Schema for å opprette kjoretoy
export const createKjoretoySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: kjoretoyBaseSchema
});

// Schema for å oppdatere kjoretoy  
export const updateKjoretoySchema = z.object({
  params: z.object({
    bedriftId: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number),
    id: z.string().regex(/^\d+$/, "Kjøretøy ID må være et tall").transform(Number)
  }),
  body: kjoretoyBaseSchema
});

// Schema for sletting (generisk)
export const deleteByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for sletting av kjoretoy
export const deleteKjoretoySchema = z.object({
  params: z.object({
    bedriftId: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number),
    id: z.string().regex(/^\d+$/, "Kjøretøy ID må være et tall").transform(Number)
  })
});

// Schema for å hente spesifikk bedrift
export const getBedriftByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å hente bedrift by name
export const getBedriftByNameSchema = z.object({
  params: z.object({
    navn: z.string()
      .min(1, "Bedriftsnavn er pakrevd")
      .max(100, "Bedriftsnavn kan ikke være lengre enn 100 tegn")
      .trim()
  })
});

// Schema for å hente ansatte for bedrift
export const getAnsatteByBedriftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number)
  })
});

// Schema for å hente kjoretoy for bedrift
export const getKjoretoyByBedriftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number)
  })
});

// Schema for å legge til klasser for bedrift
export const addKlasserToBedriftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number)
  }),
  body: z.object({
    klasser: z.array(z.string().trim().min(1, "Klassekode kan ikke være tom"))
      .min(1, "Minst én klasse må legges til")
      .max(50, "Maksimalt 50 klasser kan legges til samtidig")
  })
});

// Schema for å sette hovedbruker (allerede eksisterer, men forbedrer det)
export const setHovedbrukerForBedriftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number)
  }),
  body: z.object({
    hovedbrukerId: z.number({
      required_error: "Hovedbruker ID er pakrevd",
      invalid_type_error: "Hovedbruker ID må være et tall"
    }).positive("Hovedbruker ID må være et positivt tall")
  })
});

// Schema for å oppdatere kjoretoy  
export const updateKjoretoyForBedriftSchema = z.object({
  params: z.object({
    bedriftId: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number),
    id: z.string().regex(/^\d+$/, "Kjøretøy ID må være et tall").transform(Number)
  }),
  body: z.object({
    registreringsnummer: z.string()
      .min(1, "Registreringsnummer er pakrevd")
      .max(10, "Registreringsnummer kan ikke være lengre enn 10 tegn")
      .regex(/^[A-Z0-9]+$/, "Registreringsnummer kan kun inneholde store bokstaver og tall")
      .transform(val => val.toUpperCase().trim()),
    merke: z.string()
      .min(1, "Merke er pakrevd")
      .max(50, "Merke kan ikke være lengre enn 50 tegn")
      .trim(),
    modell: z.string()
      .min(1, "Modell er pakrevd")
      .max(50, "Modell kan ikke være lengre enn 50 tegn")
      .trim(),
    aarsmodell: z.number()
      .min(1900, "Årsmodell må være fra 1900 eller senere")
      .max(new Date().getFullYear() + 2, "Årsmodell kan ikke være mer enn 2 år frem i tid"),
    type: z.enum(['PERSONBIL', 'LASTEBIL', 'BUS', 'MOTORSYKKEL', 'ANNET'], {
      errorMap: () => ({ message: "Type må være PERSONBIL, LASTEBIL, BUS, MOTORSYKKEL eller ANNET" })
    }),
    status: z.enum(['AKTIV', 'INAKTIV', 'UNDER_SERVICE'], {
      errorMap: () => ({ message: "Status må være AKTIV, INAKTIV eller UNDER_SERVICE" })
    }).default('AKTIV'),
    forerkortklass: z.string()
      .min(1, "Førerkortklasse er pakrevd")
      .max(10, "Førerkortklasse kan ikke være lengre enn 10 tegn")
      .trim()
  })
});

// ============================================================================
// BEDRIFT VALIDATION SCHEMAS
// ============================================================================

// Opprett bedrift schema
export const opprettBedriftSchema = z.object({
  navn: z.string()
    .min(1, 'Bedriftsnavn er pakrevd')
    .max(100, 'Bedriftsnavn kan ikke være lengre enn 100 tegn')
    .trim(),
  
  organisasjonsnummer: organisasjonsnummerSchema,
  
  epost: epostSchema.optional().or(z.literal('')).transform(val => val === '' ? null : val),
  
  telefon: telefonSchema.optional().or(z.literal('')).transform(val => val === '' ? null : val),
  
  adresse: z.string()
    .max(200, 'Adresse kan ikke være lengre enn 200 tegn')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  postnummer: postnummerSchema.optional().or(z.literal('')).transform(val => val === '' ? null : val),
  
  poststed: z.string()
    .max(50, 'Poststed kan ikke være lengre enn 50 tegn')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  bransje: z.string()
    .max(100, 'Bransje kan ikke være lengre enn 100 tegn')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  antallAnsatte: z.union([
    z.string().regex(/^\d+$/).transform(Number),
    z.number().int().nonnegative()
  ]).optional(),
  
  beskrivelse: z.string()
    .max(1000, 'Beskrivelse kan ikke være lengre enn 1000 tegn')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  nettside: z.string()
    .url('Ugyldig nettside URL')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  // Brønnøysund-data (valgfritt)
  dagligLeder: z.string()
    .max(100, 'Daglig leder navn kan ikke være lengre enn 100 tegn')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  stiftelsesdato: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Stiftelsesdato må være i format YYYY-MM-DD')
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  
  aktiv: z.boolean().default(true)
});

// Oppdater bedrift schema (alle felt valgfrie)
export const oppdaterBedriftSchema = opprettBedriftSchema.partial().extend({
  id: idSchema.optional()
});

// Søk bedrifter schema
export const sokBedrifterSchema = z.object({
  q: z.string()
    .min(1, 'Søketerm kan ikke være tom')
    .max(100, 'Søketerm kan ikke være lengre enn 100 tegn')
    .optional(),
  
  bransje: z.string().max(100).optional(),
  
  poststed: z.string().max(50).optional(),
  
  antallAnsatteFra: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  
  antallAnsatteTil: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  
  aktiv: z.string()
    .transform(val => val === 'true')
    .optional(),
  
  side: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('1'),
  
  grense: z.string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine(val => val <= 100, 'Maksimalt 100 bedrifter per side')
    .default('10'),
  
  sortering: z.enum(['navn', 'organisasjonsnummer', 'opprettet', 'oppdatert'])
    .default('navn'),
  
  retning: z.enum(['asc', 'desc']).default('asc')
});

// Bedrift statistikk schema
export const bedriftStatistikkSchema = z.object({
  fradato: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fra-dato må være i format YYYY-MM-DD')
    .optional(),
  
  tildato: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Til-dato må være i format YYYY-MM-DD')
    .optional(),
  
  bransje: z.array(z.string()).optional(),
  
  poststed: z.array(z.string()).optional()
}).refine(data => {
  if (data.fradato && data.tildato) {
    return new Date(data.fradato) <= new Date(data.tildato);
  }
  return true;
}, 'Fra-dato må være før til-dato');

// Bedrift import schema (for bulk import)
export const importBedrifterSchema = z.object({
  bedrifter: z.array(opprettBedriftSchema)
    .min(1, 'Minst én bedrift må importeres')
    .max(1000, 'Maksimalt 1000 bedrifter kan importeres om gangen'),
  
  overskrivEksisterende: z.boolean().default(false),
  
  validerOrganisasjonsnummer: z.boolean().default(true)
});

// Bedrift eksport schema
export const eksporterBedrifterSchema = z.object({
  format: z.enum(['csv', 'excel', 'json']).default('csv'),
  
  felt: z.array(z.enum([
    'navn', 'organisasjonsnummer', 'epost', 'telefon', 
    'adresse', 'postnummer', 'poststed', 'bransje',
    'antallAnsatte', 'beskrivelse', 'nettside',
    'dagligLeder', 'stiftelsesdato', 'opprettet', 'oppdatert'
  ])).optional(),
  
  filter: sokBedrifterSchema.omit({ side: true, grense: true }).optional()
});

// ============================================================================
// VALIDATION MIDDLEWARE FOR BEDRIFT ROUTES
// ============================================================================

import { validateRequest } from '../middleware/requestValidation';

// POST /api/bedrifter
export const validateOpprettBedrift = validateRequest({
  body: opprettBedriftSchema
});

// PUT /api/bedrifter/:id
export const validateOppdaterBedrift = validateRequest({
  params: z.object({ id: idSchema }),
  body: oppdaterBedriftSchema
});

// GET /api/bedrifter/:id
export const validateHentBedrift = validateRequest({
  params: z.object({ id: idSchema })
});

// DELETE /api/bedrifter/:id
export const validateSlettBedrift = validateRequest({
  params: z.object({ id: idSchema })
});

// GET /api/bedrifter (søk)
export const validateSokBedrifter = validateRequest({
  query: sokBedrifterSchema
});

// GET /api/bedrifter/statistikk
export const validateBedriftStatistikk = validateRequest({
  query: bedriftStatistikkSchema
});

// POST /api/bedrifter/import
export const validateImportBedrifter = validateRequest({
  body: importBedrifterSchema
});

// POST /api/bedrifter/eksporter
export const validateEksporterBedrifter = validateRequest({
  body: eksporterBedrifterSchema
});

// GET /api/bedrifter/organisasjonsnummer/:orgNummer
export const validateHentBedriftByOrgNummer = validateRequest({
  params: z.object({ orgNummer: organisasjonsnummerSchema })
}); 
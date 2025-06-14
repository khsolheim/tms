import { z } from 'zod';

// Personnummer-validering
const personnummerRegex = /^\d{11}$/;
const postnummerRegex = /^\d{4}$/;
const telefonRegex = /^(\+47)?[\s]?[\d\s-()]+$/;

// Basis elev/person schema
const personSchema = z.object({
  fornavn: z.string().min(1, 'Fornavn er påkrevd').max(100, 'Fornavn kan ikke være lengre enn 100 tegn'),
  etternavn: z.string().min(1, 'Etternavn er påkrevd').max(100, 'Etternavn kan ikke være lengre enn 100 tegn'),
  personnummer: z.string().regex(personnummerRegex, 'Personnummer må være 11 siffer'),
  telefon: z.string().regex(telefonRegex, 'Ugyldig telefonnummer'),
  epost: z.string().email('Ugyldig e-postadresse'),
  gate: z.string().min(1, 'Gateadresse er påkrevd').max(200, 'Gateadresse kan ikke være lengre enn 200 tegn'),
  postnr: z.string().regex(postnummerRegex, 'Postnummer må være 4 siffer'),
  poststed: z.string().min(1, 'Poststed er påkrevd').max(100, 'Poststed kan ikke være lengre enn 100 tegn')
});

// Kontrakt opprettelse schema (kun body data)
const kontraktOpprettBodySchema = z.object({
  // Elevinfo
  elevFornavn: z.string().min(1, 'Fornavn er påkrevd').max(100),
  elevEtternavn: z.string().min(1, 'Etternavn er påkrevd').max(100),
  elevPersonnummer: z.string().regex(personnummerRegex, 'Personnummer må være 11 siffer'),
  elevTelefon: z.string().regex(telefonRegex, 'Ugyldig telefonnummer'),
  elevEpost: z.string().email('Ugyldig e-postadresse'),
  elevGate: z.string().min(1, 'Gateadresse er påkrevd').max(200),
  elevPostnr: z.string().regex(postnummerRegex, 'Postnummer må være 4 siffer'),
  elevPoststed: z.string().min(1, 'Poststed er påkrevd').max(100),
  
  // Fakturaansvarlig (valgfri)
  harFakturaansvarlig: z.boolean(),
  fakturaansvarligFornavn: z.string().max(100).optional(),
  fakturaansvarligEtternavn: z.string().max(100).optional(),
  fakturaansvarligPersonnummer: z.string().optional(),
  fakturaansvarligTelefon: z.string().optional(),
  fakturaansvarligEpost: z.string().optional(),
  fakturaansvarligGate: z.string().max(200).optional(),
  fakturaansvarligPostnr: z.string().optional(),
  fakturaansvarligPoststed: z.string().max(100).optional(),
  
  // Låneinformasjon
  lan: z.number().min(1000, 'Lånebeløp må være minst 1000 kr').max(1000000, 'Lånebeløp kan ikke overstige 1 000 000 kr'),
  lopetid: z.number().refine(val => [12, 24, 36].includes(val), {
    message: 'Løpetid må være 12, 24 eller 36 måneder'
  }),
  rente: z.number().min(0, 'Rente kan ikke være negativ').max(50, 'Rente kan ikke overstige 50%'),
  etableringsgebyr: z.number().min(0, 'Etableringsgebyr kan ikke være negativt').max(10000, 'Etableringsgebyr kan ikke overstige 10 000 kr'),
  termingebyr: z.number().min(0, 'Termingebyr kan ikke være negativt').max(500, 'Termingebyr kan ikke overstige 500 kr'),
  terminerPerAr: z.number().min(1).max(12).default(12),
  inkludererGebyrerILan: z.boolean().default(false),
  
  // Beregnede verdier
  effektivRente: z.number(),
  renterOgGebyr: z.number(),
  terminbelop: z.number(),
  totalRente: z.number(),
  totalBelop: z.number()
}).refine(data => {
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
  message: 'Alle fakturaansvarlig-felt må fylles ut når fakturaansvarlig er aktivert',
  path: ['harFakturaansvarlig']
});

// Schema for middleware som validerer hele request objektet
export const kontraktOpprettSchema = z.object({
  body: kontraktOpprettBodySchema
});

// Schema for å hente spesifikk kontrakt
export const getKontraktSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å slette kontrakt  
export const deleteKontraktSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Kontrakt oppdatering schema
export const kontraktOppdaterSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    status: z.enum(['UTKAST', 'GODKJENT', 'SIGNERT', 'AKTIV', 'AVSLUTTET', 'KANSELLERT']).optional(),
    // Andre felt som kan oppdateres - bruk samme schema som opprettelse men gjør alt optional
    elevFornavn: z.string().min(1, 'Fornavn er påkrevd').max(100).optional(),
    elevEtternavn: z.string().min(1, 'Etternavn er påkrevd').max(100).optional(),
    elevPersonnummer: z.string().regex(personnummerRegex, 'Personnummer må være 11 siffer').optional(),
    elevTelefon: z.string().regex(telefonRegex, 'Ugyldig telefonnummer').optional(),
    elevEpost: z.string().email('Ugyldig e-postadresse').optional(),
    elevGate: z.string().min(1, 'Gateadresse er påkrevd').max(200).optional(),
    elevPostnr: z.string().regex(postnummerRegex, 'Postnummer må være 4 siffer').optional(),
    elevPoststed: z.string().min(1, 'Poststed er påkrevd').max(100).optional(),
    harFakturaansvarlig: z.boolean().optional(),
    fakturaansvarligFornavn: z.string().max(100).optional(),
    fakturaansvarligEtternavn: z.string().max(100).optional(),
    fakturaansvarligPersonnummer: z.string().optional(),
    fakturaansvarligTelefon: z.string().optional(),
    fakturaansvarligEpost: z.string().optional(),
    fakturaansvarligGate: z.string().max(200).optional(),
    fakturaansvarligPostnr: z.string().optional(),
    fakturaansvarligPoststed: z.string().max(100).optional(),
    lan: z.number().min(1000, 'Lånebeløp må være minst 1000 kr').max(1000000, 'Lånebeløp kan ikke overstige 1 000 000 kr').optional(),
    lopetid: z.number().refine(val => [12, 24, 36].includes(val), {
      message: 'Løpetid må være 12, 24 eller 36 måneder'
    }).optional(),
    rente: z.number().min(0, 'Rente kan ikke være negativ').max(50, 'Rente kan ikke overstige 50%').optional(),
    etableringsgebyr: z.number().min(0, 'Etableringsgebyr kan ikke være negativt').max(10000, 'Etableringsgebyr kan ikke overstige 10 000 kr').optional(),
    termingebyr: z.number().min(0, 'Termingebyr kan ikke være negativt').max(500, 'Termingebyr kan ikke overstige 500 kr').optional(),
    terminerPerAr: z.number().min(1).max(12).optional(),
    inkludererGebyrerILan: z.boolean().optional(),
    effektivRente: z.number().optional(),
    renterOgGebyr: z.number().optional(),
    terminbelop: z.number().optional(),
    totalRente: z.number().optional(),
    totalBelop: z.number().optional()
  })
});

// SystemConfig schemas
export const systemConfigSchema = z.object({
  // Fakturainnstillinger
  dagerForfallFaktura: z.number().min(1).max(90).optional(),
  purregebyr: z.number().min(0).max(1000).optional(),
  forsinkelsesrente: z.number().min(0).max(30).optional(),
  kontonummer: z.string().max(20).optional(),
  
  // Kontraktinnstillinger
  standardRente: z.number().min(0).max(30).optional(),
  standardEtableringsgebyr: z.number().min(0).max(10000).optional(),
  standardTermingebyr: z.number().min(0).max(500).optional(),
  standardLopetid: z.number().refine(val => !val || [12, 24, 36].includes(val), {
    message: 'Standard løpetid må være 12, 24 eller 36 måneder'
  }).optional(),
  
  // E-postinnstillinger
  sendKvitteringTilElev: z.boolean().optional(),
  sendKopiTilBedrift: z.boolean().optional(),
  standardAvsenderEpost: z.string().email('Ugyldig e-postadresse').optional().or(z.string().length(0)),
  standardAvsenderNavn: z.string().max(100).optional(),
  
  // Varslingsinnstillinger
  varsleNyKontrakt: z.boolean().optional(),
  varsleStatusendring: z.boolean().optional(),
  varsleForfall: z.boolean().optional(),
  dagerForVarslingForfall: z.number().min(1).max(30).optional(),
  
  // Øvrige innstillinger
  visPersonnummerILister: z.boolean().optional(),
  tillateElevregistrering: z.boolean().optional(),
  kreverGodkjenningElevSoknad: z.boolean().optional()
});

// Type exports
export type KontraktOpprett = z.infer<typeof kontraktOpprettSchema>;
export type KontraktOppdater = z.infer<typeof kontraktOppdaterSchema>;
export type SystemConfig = z.infer<typeof systemConfigSchema>; 
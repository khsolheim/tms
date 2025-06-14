import { z } from 'zod';

// Schema for henting av systemkonfigurasjon
export const hentSystemconfigSchema = z.object({
  // Ingen body/query/params validering nødvendig
});

// Schema for oppdatering av systemkonfigurasjon
export const oppdaterSystemconfigSchema = z.object({
  body: z.object({
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
  })
});

// Type exports for TypeScript
export type OppdaterSystemconfigInput = z.infer<typeof oppdaterSystemconfigSchema>['body']; 
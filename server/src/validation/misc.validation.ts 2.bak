import { z } from 'zod';

// Schema for varslingsinnstillinger oppdatering
export const oppdaterVarslingsinnstillingerSchema = z.object({
  body: z.object({
    innstillinger: z.record(z.any()).optional(),
    epostAktiv: z.boolean().optional(),
    smsAktiv: z.boolean().optional(),
    daglingSammendrag: z.boolean().optional(),
    umiddelbareVarsler: z.boolean().optional()
  })
});

// Schema for henting av varslingsinnstillinger (ingen validering nødvendig)
export const hentVarslingsinnstillingerSchema = z.object({
  // Ingen body/query/params validering nødvendig
});

// Schema for henting av klasser (ingen validering nødvendig)
export const hentKlasserSchema = z.object({
  // Ingen body/query/params validering nødvendig
});

// Schema for health check (ingen validering nødvendig)
export const healthCheckSchema = z.object({
  // Ingen body/query/params validering nødvendig
});

// Type exports for TypeScript
export type OppdaterVarslingsinnstillingerInput = z.infer<typeof oppdaterVarslingsinnstillingerSchema>['body']; 
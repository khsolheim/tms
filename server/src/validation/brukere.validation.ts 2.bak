import { z } from 'zod';

// Schema for henting av alle brukere (kun admin)
export const hentAllebBrukereSchema = z.object({
  // Ingen body/query/params validering nødvendig da dette er admin-only GET
});

// Schema for oppdatering av tilganger
export const oppdaterTilgangerSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, "Bruker ID må være et tall")
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, "Bruker ID må være positivt")
  }),
  body: z.object({
    tilganger: z.array(z.string())
      .min(0, "Tilganger array må være gyldig")
      .refine(
        (tilganger) => {
          const gyldigeTilganger = [
            'KONTRAKTER_CREATE',
            'KONTRAKTER_READ', 
            'KONTRAKTER_UPDATE',
            'KONTRAKTER_DELETE',
            'ELEVER_CREATE',
            'ELEVER_READ',
            'ELEVER_UPDATE', 
            'ELEVER_DELETE',
            'SIKKERHETSKONTROLL_CREATE',
            'SIKKERHETSKONTROLL_READ',
            'SIKKERHETSKONTROLL_UPDATE',
            'SIKKERHETSKONTROLL_DELETE',
            'QUIZ_CREATE',
            'QUIZ_READ',
            'QUIZ_UPDATE',
            'QUIZ_DELETE',
            'RAPPORTER_READ',
            'INNSTILLINGER_UPDATE',
            'ADMIN_ALL'
          ];
          return tilganger.every(tilgang => gyldigeTilganger.includes(tilgang));
        },
        "En eller flere tilganger er ugyldige"
      )
  })
});

// Type exports for TypeScript
export type OppdaterTilgangerInput = z.infer<typeof oppdaterTilgangerSchema>['body'];
export type OppdaterTilgangerParams = z.infer<typeof oppdaterTilgangerSchema>['params']; 
import { z } from 'zod';

// Schema for å opprette sikkerhetskontroll
export const createSikkerhetskontrollSchema = z.object({
  body: z.object({
    navn: z.string()
      .min(2, "Navn må være minst 2 tegn")
      .max(100, "Navn kan ikke være lengre enn 100 tegn")
      .trim(),
    beskrivelse: z.string()
      .max(500, "Beskrivelse kan ikke være lengre enn 500 tegn")
      .optional()
      .nullable(),
    sjekkpunkter: z.array(
      z.object({
        sjekkpunktId: z.number({
          required_error: "Sjekkpunkt ID er påkrevd",
          invalid_type_error: "Sjekkpunkt ID må være et tall"
        }).positive("Sjekkpunkt ID må være et positivt tall"),
        rekkefølge: z.number({
          required_error: "Rekkefølge er påkrevd",
          invalid_type_error: "Rekkefølge må være et tall"
        }).min(1, "Rekkefølge må være minst 1"),
        kanGodkjennesAv: z.enum(['LÆRER', 'ELEV', 'BEGGE'], {
          errorMap: () => ({ message: "Må være 'LÆRER', 'ELEV' eller 'BEGGE'" })
        }).default('LÆRER'),
        påkrevd: z.boolean().default(true)
      })
    ).min(1, "Minst ett sjekkpunkt må velges"),
    kontrollmalId: z.number({
      invalid_type_error: "Kontrollmal ID må være et tall"
    }).positive("Kontrollmal ID må være et positivt tall").optional().nullable(),
    bedriftId: z.number({
      invalid_type_error: "Bedrift ID må være et tall"
    }).positive("Bedrift ID må være et positivt tall").optional()
  })
});

// Schema for å oppdatere sikkerhetskontroll
export const updateSikkerhetskontrollSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    navn: z.string()
      .min(2, "Navn må være minst 2 tegn")
      .max(100, "Navn kan ikke være lengre enn 100 tegn")
      .trim()
      .optional(),
    beskrivelse: z.string()
      .max(500, "Beskrivelse kan ikke være lengre enn 500 tegn")
      .optional()
      .nullable(),
    sjekkpunkter: z.array(
      z.object({
        sjekkpunktId: z.number({
          required_error: "Sjekkpunkt ID er påkrevd",
          invalid_type_error: "Sjekkpunkt ID må være et tall"
        }).positive("Sjekkpunkt ID må være et positivt tall"),
        rekkefølge: z.number({
          required_error: "Rekkefølge er påkrevd",
          invalid_type_error: "Rekkefølge må være et tall"
        }).min(1, "Rekkefølge må være minst 1"),
        kanGodkjennesAv: z.enum(['LÆRER', 'ELEV', 'BEGGE'], {
          errorMap: () => ({ message: "Må være 'LÆRER', 'ELEV' eller 'BEGGE'" })
        }).default('LÆRER'),
        påkrevd: z.boolean().default(true)
      })
    ).min(1, "Minst ett sjekkpunkt må velges").optional(),
    kontrollmalId: z.number({
      invalid_type_error: "Kontrollmal ID må være et tall"
    }).positive("Kontrollmal ID må være et positivt tall").optional().nullable()
  })
});

// Schema for å slette sikkerhetskontroll
export const deleteSikkerhetskontrollSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å hente sikkerhetskontroll med ID
export const getSikkerhetskontrollByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å hente sikkerhetskontroller med query parameters
export const getSikkerhetskontrollerQuerySchema = z.object({
  query: z.object({
    bedriftId: z.string()
      .regex(/^\d+$/, "Bedrift ID må være et tall")
      .transform(Number)
      .optional(),
    kontrollmalId: z.string()
      .regex(/^\d+$/, "Kontrollmal ID må være et tall")
      .transform(Number)
      .optional(),
    status: z.enum(['AKTIV', 'INAKTIV', 'AVSLUTTET'], {
      errorMap: () => ({ message: "Status må være 'AKTIV', 'INAKTIV' eller 'AVSLUTTET'" })
    }).optional(),
    limit: z.string()
      .regex(/^\d+$/, "Limit må være et tall")
      .transform(Number)
      .optional(),
    offset: z.string()
      .regex(/^\d+$/, "Offset må være et tall")
      .transform(Number)
      .optional()
  })
});

// Schema for å registrere avvik
export const registrerAvvikSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    sjekkpunktId: z.number({
      required_error: "Sjekkpunkt ID er påkrevd",
      invalid_type_error: "Sjekkpunkt ID må være et tall"
    }).positive("Sjekkpunkt ID må være et positivt tall"),
    beskrivelse: z.string()
      .min(10, "Beskrivelse av avvik må være minst 10 tegn")
      .max(1000, "Beskrivelse kan ikke være lengre enn 1000 tegn")
      .trim(),
    alvorlighetsgrad: z.enum(['LAV', 'MIDDELS', 'HOY', 'KRITISK'], {
      errorMap: () => ({ message: "Alvorlighetsgrad må være 'LAV', 'MIDDELS', 'HOY' eller 'KRITISK'" })
    }).default('MIDDELS'),
    handlingsplan: z.string()
      .max(1000, "Handlingsplan kan ikke være lengre enn 1000 tegn")
      .optional()
      .nullable(),
    fristUtbedring: z.string()
      .date("Ugyldig dato format")
      .optional()
      .nullable()
  })
});

// Schema for å godkjenne sjekkpunkt
export const godkjennSjekkpunktSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    sjekkpunktId: z.number({
      required_error: "Sjekkpunkt ID er påkrevd",
      invalid_type_error: "Sjekkpunkt ID må være et tall"
    }).positive("Sjekkpunkt ID må være et positivt tall"),
    godkjent: z.boolean({
      required_error: "Godkjent status er påkrevd",
      invalid_type_error: "Godkjent må være boolean"
    }),
    kommentar: z.string()
      .max(500, "Kommentar kan ikke være lengre enn 500 tegn")
      .optional()
      .nullable()
  })
}); 
import { z } from 'zod';

// Hjelpefunksjoner for norske validatorer
const telefonRegex = /^(\+47)?[\s]?(\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2}|\d{3}[\s]?\d{2}[\s]?\d{3}|\d{8})$/;

// Passord validering regler
const passordSchema = z.string()
  .min(8, "Passord må være minst 8 tegn")
  .max(100, "Passord kan ikke være lengre enn 100 tegn")
  .regex(/(?=.*[a-z])/, "Passord må inneholde minst én liten bokstav")
  .regex(/(?=.*[A-Z])/, "Passord må inneholde minst én stor bokstav")
  .regex(/(?=.*\d)/, "Passord må inneholde minst ett tall")
  .regex(/(?=.*[@$!%*?&])/, "Passord må inneholde minst ett spesialtegn (@$!%*?&)");

// Schema for ansatt registrering
export const ansattRegistrerSchema = z.object({
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
    .max(100, "Passord kan ikke være lengre enn 100 tegn"),
  bekreftPassord: z.string().optional(),
  telefon: z.string()
    .regex(telefonRegex, "Ugyldig telefonnummer format")
    .optional()
    .nullable(),
  adresse: z.string()
    .max(200, "Adresse kan ikke være lengre enn 200 tegn")
    .optional()
    .nullable(),
  postnummer: z.string()
    .regex(/^\d{4}$/, "Postnummer må være 4 siffer")
    .optional()
    .nullable(),
  poststed: z.string()
    .max(100, "Poststed kan ikke være lengre enn 100 tegn")
    .optional()
    .nullable(),
  rolle: z.enum(['HOVEDBRUKER', 'TRAFIKKLARER', 'ADMIN']).optional(),
  klasser: z.array(z.string()).optional(),
  kjøretøy: z.array(z.number()).optional(),
  hovedkjøretøy: z.number().optional().nullable(),
  bedriftId: z.number({
    required_error: "Bedrift ID er påkrevd",
    invalid_type_error: "Bedrift ID må være et tall"
  }).positive("Bedrift ID må være et positivt tall")
}).refine((data) => !data.bekreftPassord || data.passord === data.bekreftPassord, {
  message: "Passordene stemmer ikke overens",
  path: ["bekreftPassord"]
});

// Schema for ansatt innlogging
export const ansattInnloggingSchema = z.object({
  body: z.object({
    epost: z.string()
      .email("Ugyldig e-postadresse")
      .toLowerCase()
      .trim(),
    passord: z.string()
      .min(1, "Passord er påkrevd")
  })
});

// Schema for å oppdatere ansatt profil
export const oppdaterAnsattProfilSchema = z.object({
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
    telefon: z.string()
      .regex(telefonRegex, "Ugyldig telefonnummer format")
      .optional()
      .nullable(),
    kallenavn: z.string()
      .max(50, "Kallenavn kan ikke være lengre enn 50 tegn")
      .optional()
      .nullable(),
    om_meg_selv: z.string()
      .max(500, "Om meg selv kan ikke være lengre enn 500 tegn")
      .optional()
      .nullable(),
    cv: z.string()
      .max(2000, "CV kan ikke være lengre enn 2000 tegn")
      .optional()
      .nullable(),
    // Utvidet profil informasjon
    fodselsdag: z.string().date().optional().nullable(),
    kjonn: z.enum(['MANN', 'KVINNE', 'ANNET']).optional().nullable(),
    nasjonalitet: z.string()
      .max(50, "Nasjonalitet kan ikke være lengre enn 50 tegn")
      .optional()
      .nullable(),
    adresse: z.string()
      .max(200, "Adresse kan ikke være lengre enn 200 tegn")
      .optional()
      .nullable(),
    postnummer: z.string()
      .regex(/^\d{4}$/, "Postnummer må være 4 siffer")
      .optional()
      .nullable(),
    poststed: z.string()
      .max(100, "Poststed kan ikke være lengre enn 100 tegn")
      .optional()
      .nullable(),
    nokontaktNavn: z.string()
      .max(100, "Nødkontakt navn kan ikke være lengre enn 100 tegn")
      .optional()
      .nullable(),
    nokontaktTelefon: z.string()
      .regex(telefonRegex, "Ugyldig telefonnummer format for nødkontakt")
      .optional()
      .nullable(),
    ansattKode: z.string()
      .max(20, "Ansattkode kan ikke være lengre enn 20 tegn")
      .optional()
      .nullable(),
    avdeling: z.string()
      .max(100, "Avdeling kan ikke være lengre enn 100 tegn")
      .optional()
      .nullable()
  })
});

// Schema for å endre passord
export const endrePassordSchema = z.object({
  body: z.object({
    gammeltPassord: z.string()
      .min(1, "Gammelt passord er påkrevd"),
    nyttPassord: passordSchema,
    bekreftNyttPassord: z.string()
  }).refine((data) => data.nyttPassord === data.bekreftNyttPassord, {
    message: "De nye passordene stemmer ikke overens",
    path: ["bekreftNyttPassord"]
  }).refine((data) => data.gammeltPassord !== data.nyttPassord, {
    message: "Nytt passord kan ikke være det samme som det gamle",
    path: ["nyttPassord"]
  })
});

// Schema for glemt passord (be om reset link)
export const glemtPassordSchema = z.object({
  body: z.object({
    epost: z.string()
      .email("Ugyldig e-postadresse")
      .toLowerCase()
      .trim()
  })
});

// Schema for å tilbakestille passord (med token)
export const tilbakestillPassordSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, "Token er påkrevd"),
    nyttPassord: passordSchema,
    bekreftNyttPassord: z.string()
  }).refine((data) => data.nyttPassord === data.bekreftNyttPassord, {
    message: "Passordene stemmer ikke overens",
    path: ["bekreftNyttPassord"]
  })
});

// Schema for admin å oppdatere ansatt
export const adminOppdaterAnsattSchema = z.object({
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
    rolle: z.enum(['ADMIN', 'TRAFIKKLARER', 'SENSOR']).optional(),
    aktiv: z.boolean().optional(),
    bedriftId: z.number()
      .positive("Bedrift ID må være et positivt tall")
      .optional()
  })
});

// Schema for admin å tilbakestille passord for ansatt
export const adminTilbakestillPassordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    nyttPassord: passordSchema
  })
});

// Schema for å slette ansatt
export const slettAnsattSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for å hente ansatte for en bedrift
export const hentAnsatteBedriftSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Bedrift ID må være et tall").transform(Number)
  })
});

// Schema for admin å oppdatere tilganger
export const adminOppdaterTilgangerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    tilganger: z.array(z.string()).default([])
  })
});

// Schema for impersonering
export const impersonerBrukerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
}); 
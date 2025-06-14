import { z } from 'zod';

// Enum verdier basert på database schema
const kategoriEnum = z.enum(['KJORESKOLE', 'SIKKERHET', 'VEDLIKEHOLD', 'MILJØ', 'ØKONOMI', 'GENERELL']);
const kanGodkjennesAvEnum = z.enum(['LAERER', 'ANSATT', 'ADMIN']);

// Schema for punkt i kontrollmal
const kontrollMalPunktSchema = z.object({
  sjekkpunktId: z.number().int().positive('Sjekkpunkt ID må være et positivt tall'),
  rekkefølge: z.number().int().positive().optional(),
  kanGodkjennesAv: kanGodkjennesAvEnum.default('LAERER'),
  påkrevd: z.boolean().default(true)
});

// Schema for opprettelse av kontrollmal
export const opprettKontrollMalSchema = z.object({
  body: z.object({
    navn: z.string()
      .min(1, 'Navn er påkrevd')
      .max(200, 'Navn kan ikke være lengre enn 200 tegn'),
    beskrivelse: z.string()
      .max(1000, 'Beskrivelse kan ikke være lengre enn 1000 tegn')
      .optional(),
    kategori: kategoriEnum,
    tags: z.array(z.string().max(50, 'Tag kan ikke være lengre enn 50 tegn'))
      .max(10, 'Maksimalt 10 tags tillatt')
      .default([]),
    offentlig: z.boolean().default(true),
    punkter: z.array(kontrollMalPunktSchema)
      .min(1, 'Minst ett punkt er påkrevd')
      .max(50, 'Maksimalt 50 punkter tillatt')
  })
});

// Schema for henting av kontrollmaler med query parameters
export const getKontrollMalerSchema = z.object({
  query: z.object({
    kategori: kategoriEnum.optional(),
    offentlig: z.string().optional().refine(val => !val || ['true', 'false'].includes(val), {
      message: 'offentlig må være "true" eller "false"'
    }),
    tags: z.union([z.string(), z.array(z.string())]).optional(),
    opprettetAvId: z.string().regex(/^\d+$/, 'opprettetAvId må være et tall').optional()
  })
});

// Schema for henting av spesifikk kontrollmal
export const getKontrollMalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for kopiering av kontrollmal til sikkerhetskontroll
export const kopierKontrollMalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    navn: z.string()
      .min(1, 'Navn er påkrevd')
      .max(200, 'Navn kan ikke være lengre enn 200 tegn'),
    beskrivelse: z.string()
      .max(1000, 'Beskrivelse kan ikke være lengre enn 1000 tegn')
      .optional(),
    bedriftId: z.number().int().positive('Bedrift ID må være et positivt tall')
  })
});

// Schema for oppdatering av kontrollmal
export const oppdaterKontrollMalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  }),
  body: z.object({
    navn: z.string()
      .min(1, 'Navn er påkrevd')
      .max(200, 'Navn kan ikke være lengre enn 200 tegn')
      .optional(),
    beskrivelse: z.string()
      .max(1000, 'Beskrivelse kan ikke være lengre enn 1000 tegn')
      .optional(),
    kategori: kategoriEnum.optional(),
    tags: z.array(z.string().max(50, 'Tag kan ikke være lengre enn 50 tegn'))
      .max(10, 'Maksimalt 10 tags tillatt')
      .optional(),
    offentlig: z.boolean().optional(),
    aktiv: z.boolean().optional(),
    punkter: z.array(kontrollMalPunktSchema)
      .min(1, 'Minst ett punkt er påkrevd')
      .max(50, 'Maksimalt 50 punkter tillatt')
      .optional()
  })
});

// Schema for sletting av kontrollmal
export const slettKontrollMalSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Type exports
export type OpprettKontrollMal = z.infer<typeof opprettKontrollMalSchema>;
export type OppdaterKontrollMal = z.infer<typeof oppdaterKontrollMalSchema>;
export type KopierKontrollMal = z.infer<typeof kopierKontrollMalSchema>;
export type GetKontrollMaler = z.infer<typeof getKontrollMalerSchema>;
export type GetKontrollMal = z.infer<typeof getKontrollMalSchema>;
export type SlettKontrollMal = z.infer<typeof slettKontrollMalSchema>; 
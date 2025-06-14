import { z } from 'zod';

// Schema for henting av bilder med query parameters
export const getBilderSchema = z.object({
  query: z.object({
    tag: z.string()
      .min(1, 'Tag må være minst 1 tegn')
      .max(50, 'Tag kan ikke være lengre enn 50 tegn')
      .optional(),
    sok: z.string()
      .min(1, 'Søketerm må være minst 1 tegn')
      .max(100, 'Søketerm kan ikke være lengre enn 100 tegn')
      .optional()
  })
});

// Schema for bilde upload (body data)
export const uploadBildeSchema = z.object({
  body: z.object({
    navn: z.string()
      .min(1, 'Navn er påkrevd')
      .max(200, 'Navn kan ikke være lengre enn 200 tegn')
      .optional(),
    beskrivelse: z.string()
      .max(1000, 'Beskrivelse kan ikke være lengre enn 1000 tegn')
      .optional(),
    tags: z.union([
      z.string().transform(str => str.split(',').map(t => t.trim()).filter(t => t.length > 0)),
      z.array(z.string().max(50, 'Tag kan ikke være lengre enn 50 tegn'))
    ])
    .refine(tags => tags.length <= 20, {
      message: 'Maksimalt 20 tags tillatt'
    })
    .optional()
  })
});

// Schema for henting av spesifikt bilde
export const getBildeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Schema for oppdatering av bilde
export const oppdaterBildeSchema = z.object({
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
    tags: z.union([
      z.string().transform(str => str.split(',').map(t => t.trim()).filter(t => t.length > 0)),
      z.array(z.string().max(50, 'Tag kan ikke være lengre enn 50 tegn'))
    ])
    .refine(tags => tags.length <= 20, {
      message: 'Maksimalt 20 tags tillatt'
    })
    .optional()
  })
});

// Schema for sletting av bilde
export const slettBildeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID må være et tall").transform(Number)
  })
});

// Hjelpefunksjon for å validere filtype og størrelse
export const validateImageFile = (file: Express.Multer.File) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Ugyldig filtype. Kun JPEG, PNG, GIF og WebP er tillatt.');
  }
  
  if (file.size > maxSize) {
    throw new Error('Filen er for stor. Maksimal størrelse er 10MB.');
  }
  
  return true;
};

// Type exports
export type GetBilder = z.infer<typeof getBilderSchema>;
export type UploadBilde = z.infer<typeof uploadBildeSchema>;
export type GetBilde = z.infer<typeof getBildeSchema>;
export type OppdaterBilde = z.infer<typeof oppdaterBildeSchema>;
export type SlettBilde = z.infer<typeof slettBildeSchema>; 
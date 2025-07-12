import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../utils/logger";

const router = Router();
const prisma = new PrismaClient();

interface FordelItem {
  id: number;
  type: 'annonsor' | 'sponsor';
  navn: string;
  beskrivelse?: string;
  logoUrl?: string;
  hjemmeside?: string;
  kategori: string;
  prioritet: number;
  fordeler: Array<{
    id: number;
    tittel: string;
    beskrivelse: string;
    rabattKode?: string;
    rabattProsent?: number;
    rabattBelop?: number;
    gyldigFra?: Date;
    gyldigTil?: Date;
    maksAntallBruk?: number;
    antallBrukt: number;
    vilkar?: string;
    bildeUrl?: string;
    linkUrl?: string;
  }>;
  bedrift?: {
    id: number;
    navn: string;
    organisasjonsnummer: string;
  };
}

/**
 * @swagger
 * /fordeler:
 *   get:
 *     summary: Hent alle fordeler for elever
 *     description: Henter liste over alle aktive fordeler fra annonsører og sponsorer
 *     tags: [Fordeler]
 *     parameters:
 *       - in: query
 *         name: kategori
 *         schema:
 *           type: string
 *         description: Filtrer på kategori
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [annonsor, sponsor, alle]
 *         description: Filtrer på type (annonsor, sponsor, eller alle)
 *       - in: query
 *         name: soek
 *         schema:
 *           type: string
 *         description: Søk i navn og beskrivelse
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Antall fordeler å hente
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for paginering
 *     responses:
 *       200:
 *         description: Fordeler hentet vellykket
 */
router.get('/', 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { kategori, type, soek, limit = 20, offset = 0 } = req.query as any;

    logger.info('Henter fordeler for elever', { 
      filters: { kategori, type, soek, limit, offset }
    });

    const currentDate = new Date();
    const fordeler: FordelItem[] = [];

    // Hent annonsører og deres fordeler
    if (!type || type === 'alle' || type === 'annonsor') {
      const annonsorWhere: any = {
        isDeleted: false,
        aktiv: true
      };

      if (kategori) {
        annonsorWhere.kategori = kategori;
      }

      if (soek) {
        annonsorWhere.OR = [
          { navn: { contains: soek, mode: 'insensitive' } },
          { beskrivelse: { contains: soek, mode: 'insensitive' } }
        ];
      }

      const annonsorer = await prisma.annonsor.findMany({
        where: annonsorWhere,
        include: {
          bedrift: {
            select: {
              id: true,
              navn: true,
              organisasjonsnummer: true
            }
          },
          fordeler: {
            where: {
              aktiv: true,
              OR: [
                { gyldigTil: null },
                { gyldigTil: { gte: currentDate } }
              ]
            },
            orderBy: { opprettet: 'desc' }
          }
        },
        orderBy: [
          { prioritet: 'desc' },
          { opprettet: 'desc' }
        ]
      });

      fordeler.push(...annonsorer
        .filter(a => a.fordeler.length > 0)
        .map(a => ({
          id: a.id,
          type: 'annonsor' as const,
          navn: a.navn,
          beskrivelse: a.beskrivelse,
          logoUrl: a.logoUrl,
          hjemmeside: a.hjemmeside,
          kategori: a.kategori,
          prioritet: a.prioritet,
          fordeler: a.fordeler,
          bedrift: a.bedrift
        })));
    }

    // Hent sponsorer og deres fordeler
    if (!type || type === 'alle' || type === 'sponsor') {
      const sponsorWhere: any = {
        isDeleted: false,
        aktiv: true
      };

      if (kategori) {
        sponsorWhere.kategori = kategori;
      }

      if (soek) {
        sponsorWhere.OR = [
          { navn: { contains: soek, mode: 'insensitive' } },
          { beskrivelse: { contains: soek, mode: 'insensitive' } }
        ];
      }

      const sponsorer = await prisma.sponsor.findMany({
        where: sponsorWhere,
        include: {
          bedrift: {
            select: {
              id: true,
              navn: true,
              organisasjonsnummer: true
            }
          },
          fordeler: {
            where: {
              aktiv: true,
              OR: [
                { gyldigTil: null },
                { gyldigTil: { gte: currentDate } }
              ]
            },
            orderBy: { opprettet: 'desc' }
          }
        },
        orderBy: [
          { prioritet: 'desc' },
          { opprettet: 'desc' }
        ]
      });

      fordeler.push(...sponsorer
        .filter(s => s.fordeler.length > 0)
        .map(s => ({
          id: s.id,
          type: 'sponsor' as const,
          navn: s.navn,
          beskrivelse: s.beskrivelse,
          logoUrl: s.logoUrl,
          hjemmeside: s.hjemmeside,
          kategori: s.kategori,
          prioritet: s.prioritet,
          fordeler: s.fordeler,
          bedrift: s.bedrift
        })));
    }

    // Sorter etter prioritet og opprettelse
    fordeler.sort((a, b) => {
      if (a.prioritet !== b.prioritet) {
        return b.prioritet - a.prioritet;
      }
      return 0; // Behold eksisterende rekkefølge hvis prioritet er lik
    });

    // Paginering
    const paginatedFordeler = fordeler.slice(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string)
    );

    logger.info('Fordeler hentet for elever', { 
      count: paginatedFordeler.length,
      total: fordeler.length
    });

    res.json({
      fordeler: paginatedFordeler,
      total: fordeler.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  })
);

/**
 * @swagger
 * /fordeler/kategorier:
 *   get:
 *     summary: Hent tilgjengelige kategorier
 *     description: Henter liste over alle tilgjengelige kategorier for fordeler
 *     tags: [Fordeler]
 *     responses:
 *       200:
 *         description: Kategorier hentet vellykket
 */
router.get('/kategorier', 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    logger.info('Henter tilgjengelige kategorier for fordeler');

    const [annonsorKategorier, sponsorKategorier] = await Promise.all([
      prisma.annonsor.findMany({
        where: { 
          isDeleted: false,
          aktiv: true,
          fordeler: {
            some: { aktiv: true }
          }
        },
        select: { kategori: true },
        distinct: ['kategori']
      }),
      prisma.sponsor.findMany({
        where: { 
          isDeleted: false,
          aktiv: true,
          fordeler: {
            some: { aktiv: true }
          }
        },
        select: { kategori: true },
        distinct: ['kategori']
      })
    ]);

    const kategorier = [
      ...new Set([
        ...annonsorKategorier.map(a => a.kategori),
        ...sponsorKategorier.map(s => s.kategori)
      ])
    ].sort();

    logger.info('Kategorier hentet', { count: kategorier.length });

    res.json(kategorier);
  })
);

/**
 * @swagger
 * /fordeler/fordel/{type}/{id}:
 *   get:
 *     summary: Hent detaljer for en spesifikk fordel
 *     description: Henter detaljert informasjon om en fordel
 *     tags: [Fordeler]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [annonsor, sponsor]
 *         description: Type fordel
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fordel ID
 *     responses:
 *       200:
 *         description: Fordel hentet vellykket
 *       404:
 *         description: Fordel ikke funnet
 */
router.get('/fordel/:type/:id', 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type, id } = req.params as any;

    logger.info('Henter fordel detaljer', { type, id });

    if (type === 'annonsor') {
      const annonsor = await prisma.annonsor.findFirst({
        where: { 
          id: parseInt(id),
          isDeleted: false,
          aktiv: true
        },
        include: {
          bedrift: {
            select: {
              id: true,
              navn: true,
              organisasjonsnummer: true,
              telefon: true,
              epost: true
            }
          },
          fordeler: {
            where: { aktiv: true },
            orderBy: { opprettet: 'desc' }
          }
        }
      });

      if (!annonsor) {
        res.status(404).json({ message: 'Annonsør ikke funnet' });
        return;
      }

      // Øk visnings-telling
      await prisma.annonsor.update({
        where: { id: parseInt(id) },
        data: { visninger: { increment: 1 } }
      });

      res.json({
        type: 'annonsor',
        ...annonsor
      });
    } else if (type === 'sponsor') {
      const sponsor = await prisma.sponsor.findFirst({
        where: { 
          id: parseInt(id),
          isDeleted: false,
          aktiv: true
        },
        include: {
          bedrift: {
            select: {
              id: true,
              navn: true,
              organisasjonsnummer: true,
              telefon: true,
              epost: true
            }
          },
          fordeler: {
            where: { aktiv: true },
            orderBy: { opprettet: 'desc' }
          }
        }
      });

      if (!sponsor) {
        res.status(404).json({ message: 'Sponsor ikke funnet' });
        return;
      }

      // Øk visnings-telling
      await prisma.sponsor.update({
        where: { id: parseInt(id) },
        data: { visninger: { increment: 1 } }
      });

      res.json({
        type: 'sponsor',
        ...sponsor
      });
    } else {
      res.status(400).json({ message: 'Ugyldig type' });
    }
  })
);

/**
 * @swagger
 * /fordeler/klikk/{type}/{id}:
 *   post:
 *     summary: Registrer klikk på fordel
 *     description: Registrerer et klikk på fordel for statistikk
 *     tags: [Fordeler]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [annonsor, sponsor]
 *         description: Type fordel
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Fordel ID
 *     responses:
 *       200:
 *         description: Klikk registrert vellykket
 *       404:
 *         description: Fordel ikke funnet
 */
router.post('/klikk/:type/:id', 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type, id } = req.params as any;

    logger.info('Registrerer klikk på fordel', { type, id });

    if (type === 'annonsor') {
      const annonsor = await prisma.annonsor.findFirst({
        where: { 
          id: parseInt(id),
          isDeleted: false,
          aktiv: true
        }
      });

      if (!annonsor) {
        res.status(404).json({ message: 'Annonsør ikke funnet' });
        return;
      }

      await prisma.annonsor.update({
        where: { id: parseInt(id) },
        data: { klikk: { increment: 1 } }
      });
    } else if (type === 'sponsor') {
      const sponsor = await prisma.sponsor.findFirst({
        where: { 
          id: parseInt(id),
          isDeleted: false,
          aktiv: true
        }
      });

      if (!sponsor) {
        res.status(404).json({ message: 'Sponsor ikke funnet' });
        return;
      }

      await prisma.sponsor.update({
        where: { id: parseInt(id) },
        data: { klikk: { increment: 1 } }
      });
    } else {
      res.status(400).json({ message: 'Ugyldig type' });
      return;
    }

    logger.info('Klikk registrert', { type, id });

    res.json({ message: 'Klikk registrert' });
  })
);

export default router;
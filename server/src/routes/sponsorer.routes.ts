import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../utils/logger";

const router = Router();
const prisma = new PrismaClient();

interface SponsorCreateData {
  navn: string;
  beskrivelse?: string;
  logoUrl?: string;
  hjemmeside?: string;
  telefon?: string;
  epost?: string;
  bedriftId?: number;
  type?: string;
  kategori?: string;
  sponsorbelop?: number;
  kontraktStartDato?: Date;
  kontraktSluttDato?: Date;
  aktiv?: boolean;
  prioritet?: number;
}

interface SponsorUpdateData extends Partial<SponsorCreateData> {}

interface SponsorFordelCreateData {
  tittel: string;
  beskrivelse: string;
  rabattKode?: string;
  rabattProsent?: number;
  rabattBelop?: number;
  gyldigFra?: Date;
  gyldigTil?: Date;
  maksAntallBruk?: number;
  vilkar?: string;
  bildeUrl?: string;
  linkUrl?: string;
  aktiv?: boolean;
}

/**
 * @swagger
 * /sponsorer:
 *   get:
 *     summary: Hent alle sponsorer
 *     description: Henter liste over alle sponsorer
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: aktiv
 *         schema:
 *           type: boolean
 *         description: Filtrer på aktive sponsorer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer på sponsor type
 *       - in: query
 *         name: kategori
 *         schema:
 *           type: string
 *         description: Filtrer på kategori
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Antall sponsorer å hente
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for paginering
 *     responses:
 *       200:
 *         description: Sponsorer hentet vellykket
 */
router.get('/', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { aktiv, type, kategori, limit = 50, offset = 0 } = req.query as any;

    logger.info('Henter sponsorer', { 
      userId: req.bruker!.id,
      filters: { aktiv, type, kategori, limit, offset }
    });

    const where: any = {
      isDeleted: false
    };

    if (aktiv !== undefined) {
      where.aktiv = aktiv === 'true';
    }

    if (type) {
      where.type = type;
    }

    if (kategori) {
      where.kategori = kategori;
    }

    const sponsorer = await prisma.sponsor.findMany({
      where,
      include: {
        bedrift: {
          select: {
            id: true,
            navn: true,
            organisasjonsnummer: true
          }
        },
        fordeler: {
          where: { aktiv: true },
          select: {
            id: true,
            tittel: true,
            beskrivelse: true,
            rabattKode: true,
            rabattProsent: true,
            rabattBelop: true,
            gyldigFra: true,
            gyldigTil: true,
            aktiv: true
          }
        }
      },
      orderBy: [
        { prioritet: 'desc' },
        { opprettet: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.sponsor.count({ where });

    logger.info('Sponsorer hentet', { 
      userId: req.bruker!.id,
      count: sponsorer.length,
      total 
    });

    res.json({
      sponsorer,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  })
);

/**
 * @swagger
 * /sponsorer/{id}:
 *   get:
 *     summary: Hent en sponsor
 *     description: Henter detaljer for en spesifikk sponsor
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sponsor ID
 *     responses:
 *       200:
 *         description: Sponsor hentet vellykket
 *       404:
 *         description: Sponsor ikke funnet
 */
router.get('/:id', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as any;

    logger.info('Henter sponsor', { 
      userId: req.bruker!.id,
      sponsorId: id
    });

    const sponsor = await prisma.sponsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
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
      logger.warn('Sponsor ikke funnet', { 
        userId: req.bruker!.id,
        sponsorId: id 
      });
      res.status(404).json({ message: 'Sponsor ikke funnet' });
      return;
    }

    // Øk visnings-telling
    await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: { visninger: { increment: 1 } }
    });

    logger.info('Sponsor hentet', { 
      userId: req.bruker!.id,
      sponsorId: id,
      sponsorNavn: sponsor.navn
    });

    res.json(sponsor);
  })
);

/**
 * @swagger
 * /sponsorer:
 *   post:
 *     summary: Opprett ny sponsor
 *     description: Oppretter en ny sponsor
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - navn
 *             properties:
 *               navn:
 *                 type: string
 *               beskrivelse:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               hjemmeside:
 *                 type: string
 *               telefon:
 *                 type: string
 *               epost:
 *                 type: string
 *               bedriftId:
 *                 type: integer
 *               type:
 *                 type: string
 *               kategori:
 *                 type: string
 *               sponsorbelop:
 *                 type: integer
 *               kontraktStartDato:
 *                 type: string
 *                 format: date-time
 *               kontraktSluttDato:
 *                 type: string
 *                 format: date-time
 *               aktiv:
 *                 type: boolean
 *               prioritet:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sponsor opprettet vellykket
 *       400:
 *         description: Ugyldig input
 */
router.post('/', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const data: SponsorCreateData = req.body as any;

    logger.info('Oppretter sponsor', { 
      userId: req.bruker!.id,
      sponsorData: { navn: data.navn, type: data.type, kategori: data.kategori }
    });

    // Validering
    if (!data.navn || data.navn.trim().length === 0) {
      res.status(400).json({ message: 'Navn er påkrevd' });
      return;
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        navn: data.navn.trim(),
        beskrivelse: data.beskrivelse?.trim(),
        logoUrl: data.logoUrl?.trim(),
        hjemmeside: data.hjemmeside?.trim(),
        telefon: data.telefon?.trim(),
        epost: data.epost?.trim(),
        bedriftId: data.bedriftId,
        type: data.type || 'GENERELL',
        kategori: data.kategori || 'GENERELT',
        sponsorbelop: data.sponsorbelop,
        kontraktStartDato: data.kontraktStartDato,
        kontraktSluttDato: data.kontraktSluttDato,
        aktiv: data.aktiv ?? true,
        prioritet: data.prioritet ?? 1
      },
      include: {
        bedrift: {
          select: {
            id: true,
            navn: true,
            organisasjonsnummer: true
          }
        }
      }
    });

    logger.info('Sponsor opprettet', { 
      userId: req.bruker!.id,
      sponsorId: sponsor.id,
      sponsorNavn: sponsor.navn
    });

    res.status(201).json(sponsor);
  })
);

/**
 * @swagger
 * /sponsorer/{id}:
 *   put:
 *     summary: Oppdater sponsor
 *     description: Oppdaterer en eksisterende sponsor
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sponsor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               navn:
 *                 type: string
 *               beskrivelse:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               hjemmeside:
 *                 type: string
 *               telefon:
 *                 type: string
 *               epost:
 *                 type: string
 *               bedriftId:
 *                 type: integer
 *               type:
 *                 type: string
 *               kategori:
 *                 type: string
 *               sponsorbelop:
 *                 type: integer
 *               kontraktStartDato:
 *                 type: string
 *                 format: date-time
 *               kontraktSluttDato:
 *                 type: string
 *                 format: date-time
 *               aktiv:
 *                 type: boolean
 *               prioritet:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sponsor oppdatert vellykket
 *       404:
 *         description: Sponsor ikke funnet
 */
router.put('/:id', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as any;
    const data: SponsorUpdateData = req.body as any;

    logger.info('Oppdaterer sponsor', { 
      userId: req.bruker!.id,
      sponsorId: id
    });

    // Sjekk om sponsor eksisterer
    const existingSponsor = await prisma.sponsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!existingSponsor) {
      logger.warn('Sponsor ikke funnet for oppdatering', { 
        userId: req.bruker!.id,
        sponsorId: id 
      });
      res.status(404).json({ message: 'Sponsor ikke funnet' });
      return;
    }

    const updateData: any = {};

    if (data.navn !== undefined) updateData.navn = data.navn.trim();
    if (data.beskrivelse !== undefined) updateData.beskrivelse = data.beskrivelse?.trim();
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl?.trim();
    if (data.hjemmeside !== undefined) updateData.hjemmeside = data.hjemmeside?.trim();
    if (data.telefon !== undefined) updateData.telefon = data.telefon?.trim();
    if (data.epost !== undefined) updateData.epost = data.epost?.trim();
    if (data.bedriftId !== undefined) updateData.bedriftId = data.bedriftId;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.kategori !== undefined) updateData.kategori = data.kategori;
    if (data.sponsorbelop !== undefined) updateData.sponsorbelop = data.sponsorbelop;
    if (data.kontraktStartDato !== undefined) updateData.kontraktStartDato = data.kontraktStartDato;
    if (data.kontraktSluttDato !== undefined) updateData.kontraktSluttDato = data.kontraktSluttDato;
    if (data.aktiv !== undefined) updateData.aktiv = data.aktiv;
    if (data.prioritet !== undefined) updateData.prioritet = data.prioritet;

    const sponsor = await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        bedrift: {
          select: {
            id: true,
            navn: true,
            organisasjonsnummer: true
          }
        },
        fordeler: {
          where: { aktiv: true }
        }
      }
    });

    logger.info('Sponsor oppdatert', { 
      userId: req.bruker!.id,
      sponsorId: id,
      sponsorNavn: sponsor.navn
    });

    res.json(sponsor);
  })
);

/**
 * @swagger
 * /sponsorer/{id}:
 *   delete:
 *     summary: Slett sponsor
 *     description: Sletter en sponsor (soft delete)
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sponsor ID
 *     responses:
 *       200:
 *         description: Sponsor slettet vellykket
 *       404:
 *         description: Sponsor ikke funnet
 */
router.delete('/:id', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as any;

    logger.info('Sletter sponsor', { 
      userId: req.bruker!.id,
      sponsorId: id
    });

    const sponsor = await prisma.sponsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!sponsor) {
      logger.warn('Sponsor ikke funnet for sletting', { 
        userId: req.bruker!.id,
        sponsorId: id 
      });
      res.status(404).json({ message: 'Sponsor ikke funnet' });
      return;
    }

    await prisma.sponsor.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.bruker!.id
      }
    });

    logger.info('Sponsor slettet', { 
      userId: req.bruker!.id,
      sponsorId: id,
      sponsorNavn: sponsor.navn
    });

    res.json({ message: 'Sponsor slettet vellykket' });
  })
);

/**
 * @swagger
 * /sponsorer/{id}/fordeler:
 *   get:
 *     summary: Hent fordeler for sponsor
 *     description: Henter alle fordeler for en spesifikk sponsor
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sponsor ID
 *     responses:
 *       200:
 *         description: Fordeler hentet vellykket
 *       404:
 *         description: Sponsor ikke funnet
 */
router.get('/:id/fordeler', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as any;

    logger.info('Henter fordeler for sponsor', { 
      userId: req.bruker!.id,
      sponsorId: id
    });

    const sponsor = await prisma.sponsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!sponsor) {
      res.status(404).json({ message: 'Sponsor ikke funnet' });
      return;
    }

    const fordeler = await prisma.sponsorFordel.findMany({
      where: { sponsorId: parseInt(id) },
      orderBy: { opprettet: 'desc' }
    });

    res.json(fordeler);
  })
);

/**
 * @swagger
 * /sponsorer/{id}/fordeler:
 *   post:
 *     summary: Opprett ny fordel for sponsor
 *     description: Oppretter en ny fordel for en sponsor
 *     tags: [Sponsorer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sponsor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tittel
 *               - beskrivelse
 *             properties:
 *               tittel:
 *                 type: string
 *               beskrivelse:
 *                 type: string
 *               rabattKode:
 *                 type: string
 *               rabattProsent:
 *                 type: integer
 *               rabattBelop:
 *                 type: integer
 *               gyldigFra:
 *                 type: string
 *                 format: date-time
 *               gyldigTil:
 *                 type: string
 *                 format: date-time
 *               maksAntallBruk:
 *                 type: integer
 *               vilkar:
 *                 type: string
 *               bildeUrl:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               aktiv:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Fordel opprettet vellykket
 *       400:
 *         description: Ugyldig input
 *       404:
 *         description: Sponsor ikke funnet
 */
router.post('/:id/fordeler', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params as any;
    const data: SponsorFordelCreateData = req.body as any;

    logger.info('Oppretter fordel for sponsor', { 
      userId: req.bruker!.id,
      sponsorId: id,
      fordelTittel: data.tittel
    });

    // Validering
    if (!data.tittel || data.tittel.trim().length === 0) {
      res.status(400).json({ message: 'Tittel er påkrevd' });
      return;
    }

    if (!data.beskrivelse || data.beskrivelse.trim().length === 0) {
      res.status(400).json({ message: 'Beskrivelse er påkrevd' });
      return;
    }

    // Sjekk om sponsor eksisterer
    const sponsor = await prisma.sponsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!sponsor) {
      res.status(404).json({ message: 'Sponsor ikke funnet' });
      return;
    }

    const fordel = await prisma.sponsorFordel.create({
      data: {
        sponsorId: parseInt(id),
        tittel: data.tittel.trim(),
        beskrivelse: data.beskrivelse.trim(),
        rabattKode: data.rabattKode?.trim(),
        rabattProsent: data.rabattProsent,
        rabattBelop: data.rabattBelop,
        gyldigFra: data.gyldigFra,
        gyldigTil: data.gyldigTil,
        maksAntallBruk: data.maksAntallBruk,
        vilkar: data.vilkar?.trim(),
        bildeUrl: data.bildeUrl?.trim(),
        linkUrl: data.linkUrl?.trim(),
        aktiv: data.aktiv ?? true
      }
    });

    logger.info('Fordel opprettet for sponsor', { 
      userId: req.bruker!.id,
      sponsorId: id,
      fordelId: fordel.id
    });

    res.status(201).json(fordel);
  })
);

/**
 * @swagger
 * /sponsorer/{id}/click:
 *   post:
 *     summary: Registrer klikk på sponsor
 *     description: Registrerer et klikk på sponsor for statistikk
 *     tags: [Sponsorer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sponsor ID
 *     responses:
 *       200:
 *         description: Klikk registrert vellykket
 *       404:
 *         description: Sponsor ikke funnet
 */
router.post('/:id/click', 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as any;

    logger.info('Registrerer klikk på sponsor', { sponsorId: id });

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

    logger.info('Klikk registrert', { sponsorId: id });

    res.json({ message: 'Klikk registrert' });
  })
);

export default router;
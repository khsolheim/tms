import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../utils/logger";

const router = Router();
const prisma = new PrismaClient();

interface AnnonsorCreateData {
  navn: string;
  beskrivelse?: string;
  logoUrl?: string;
  hjemmeside?: string;
  telefon?: string;
  epost?: string;
  bedriftId?: number;
  kategori?: string;
  tags?: string[];
  aktiv?: boolean;
  prioritet?: number;
}

interface AnnonsorUpdateData extends Partial<AnnonsorCreateData> {}

interface AnnonsorFordelCreateData {
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
 * /annonsorer:
 *   get:
 *     summary: Hent alle annonsører
 *     description: Henter liste over alle annonsører
 *     tags: [Annonsører]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: aktiv
 *         schema:
 *           type: boolean
 *         description: Filtrer på aktive annonsører
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
 *         description: Antall annonsører å hente
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset for paginering
 *     responses:
 *       200:
 *         description: Annonsører hentet vellykket
 */
router.get('/', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { aktiv, kategori, limit = 50, offset = 0 } = req.query as any;

    logger.info('Henter annonsører', { 
      userId: req.bruker!.id,
      filters: { aktiv, kategori, limit, offset }
    });

    const where: any = {
      isDeleted: false
    };

    if (aktiv !== undefined) {
      where.aktiv = aktiv === 'true';
    }

    if (kategori) {
      where.kategori = kategori;
    }

    const annonsorer = await prisma.annonsor.findMany({
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

    const total = await prisma.annonsor.count({ where });

    logger.info('Annonsører hentet', { 
      userId: req.bruker!.id,
      count: annonsorer.length,
      total 
    });

    res.json({
      annonsorer,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  })
);

/**
 * @swagger
 * /annonsorer/{id}:
 *   get:
 *     summary: Hent en annonsør
 *     description: Henter detaljer for en spesifikk annonsør
 *     tags: [Annonsører]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Annonsør ID
 *     responses:
 *       200:
 *         description: Annonsør hentet vellykket
 *       404:
 *         description: Annonsør ikke funnet
 */
router.get('/:id', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Henter annonsør', { 
      userId: req.bruker!.id,
      annonsorId: id
    });

    const annonsor = await prisma.annonsor.findFirst({
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

    if (!annonsor) {
      logger.warn('Annonsør ikke funnet', { 
        userId: req.bruker!.id,
        annonsorId: id 
      });
      res.status(404).json({ message: 'Annonsør ikke funnet' });
      return;
    }

    // Øk visnings-telling
    await prisma.annonsor.update({
      where: { id: parseInt(id) },
      data: { visninger: { increment: 1 } }
    });

    logger.info('Annonsør hentet', { 
      userId: req.bruker!.id,
      annonsorId: id,
      annonsorNavn: annonsor.navn
    });

    res.json(annonsor);
  })
);

/**
 * @swagger
 * /annonsorer:
 *   post:
 *     summary: Opprett ny annonsør
 *     description: Oppretter en ny annonsør
 *     tags: [Annonsører]
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
 *               kategori:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               aktiv:
 *                 type: boolean
 *               prioritet:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Annonsør opprettet vellykket
 *       400:
 *         description: Ugyldig input
 */
router.post('/', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const data: AnnonsorCreateData = req.body;

    logger.info('Oppretter annonsør', { 
      userId: req.bruker!.id,
      annonsorData: { navn: data.navn, kategori: data.kategori }
    });

    // Validering
    if (!data.navn || data.navn.trim().length === 0) {
      res.status(400).json({ message: 'Navn er påkrevd' });
      return;
    }

    const annonsor = await prisma.annonsor.create({
      data: {
        navn: data.navn.trim(),
        beskrivelse: data.beskrivelse?.trim(),
        logoUrl: data.logoUrl?.trim(),
        hjemmeside: data.hjemmeside?.trim(),
        telefon: data.telefon?.trim(),
        epost: data.epost?.trim(),
        bedriftId: data.bedriftId,
        kategori: data.kategori || 'GENERELT',
        tags: data.tags || [],
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

    logger.info('Annonsør opprettet', { 
      userId: req.bruker!.id,
      annonsorId: annonsor.id,
      annonsorNavn: annonsor.navn
    });

    res.status(201).json(annonsor);
  })
);

/**
 * @swagger
 * /annonsorer/{id}:
 *   put:
 *     summary: Oppdater annonsør
 *     description: Oppdaterer en eksisterende annonsør
 *     tags: [Annonsører]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Annonsør ID
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
 *               kategori:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               aktiv:
 *                 type: boolean
 *               prioritet:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Annonsør oppdatert vellykket
 *       404:
 *         description: Annonsør ikke funnet
 */
router.put('/:id', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: AnnonsorUpdateData = req.body;

    logger.info('Oppdaterer annonsør', { 
      userId: req.bruker!.id,
      annonsorId: id
    });

    // Sjekk om annonsør eksisterer
    const existingAnnonsor = await prisma.annonsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!existingAnnonsor) {
      logger.warn('Annonsør ikke funnet for oppdatering', { 
        userId: req.bruker!.id,
        annonsorId: id 
      });
      res.status(404).json({ message: 'Annonsør ikke funnet' });
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
    if (data.kategori !== undefined) updateData.kategori = data.kategori;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.aktiv !== undefined) updateData.aktiv = data.aktiv;
    if (data.prioritet !== undefined) updateData.prioritet = data.prioritet;

    const annonsor = await prisma.annonsor.update({
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

    logger.info('Annonsør oppdatert', { 
      userId: req.bruker!.id,
      annonsorId: id,
      annonsorNavn: annonsor.navn
    });

    res.json(annonsor);
  })
);

/**
 * @swagger
 * /annonsorer/{id}:
 *   delete:
 *     summary: Slett annonsør
 *     description: Sletter en annonsør (soft delete)
 *     tags: [Annonsører]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Annonsør ID
 *     responses:
 *       200:
 *         description: Annonsør slettet vellykket
 *       404:
 *         description: Annonsør ikke funnet
 */
router.delete('/:id', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Sletter annonsør', { 
      userId: req.bruker!.id,
      annonsorId: id
    });

    const annonsor = await prisma.annonsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!annonsor) {
      logger.warn('Annonsør ikke funnet for sletting', { 
        userId: req.bruker!.id,
        annonsorId: id 
      });
      res.status(404).json({ message: 'Annonsør ikke funnet' });
      return;
    }

    await prisma.annonsor.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.bruker!.id
      }
    });

    logger.info('Annonsør slettet', { 
      userId: req.bruker!.id,
      annonsorId: id,
      annonsorNavn: annonsor.navn
    });

    res.json({ message: 'Annonsør slettet vellykket' });
  })
);

/**
 * @swagger
 * /annonsorer/{id}/fordeler:
 *   get:
 *     summary: Hent fordeler for annonsør
 *     description: Henter alle fordeler for en spesifikk annonsør
 *     tags: [Annonsører]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Annonsør ID
 *     responses:
 *       200:
 *         description: Fordeler hentet vellykket
 *       404:
 *         description: Annonsør ikke funnet
 */
router.get('/:id/fordeler', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Henter fordeler for annonsør', { 
      userId: req.bruker!.id,
      annonsorId: id
    });

    const annonsor = await prisma.annonsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!annonsor) {
      res.status(404).json({ message: 'Annonsør ikke funnet' });
      return;
    }

    const fordeler = await prisma.annonsorFordel.findMany({
      where: { annonsorId: parseInt(id) },
      orderBy: { opprettet: 'desc' }
    });

    res.json(fordeler);
  })
);

/**
 * @swagger
 * /annonsorer/{id}/fordeler:
 *   post:
 *     summary: Opprett ny fordel for annonsør
 *     description: Oppretter en ny fordel for en annonsør
 *     tags: [Annonsører]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Annonsør ID
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
 *         description: Annonsør ikke funnet
 */
router.post('/:id/fordeler', 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: AnnonsorFordelCreateData = req.body;

    logger.info('Oppretter fordel for annonsør', { 
      userId: req.bruker!.id,
      annonsorId: id,
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

    // Sjekk om annonsør eksisterer
    const annonsor = await prisma.annonsor.findFirst({
      where: { 
        id: parseInt(id),
        isDeleted: false
      }
    });

    if (!annonsor) {
      res.status(404).json({ message: 'Annonsør ikke funnet' });
      return;
    }

    const fordel = await prisma.annonsorFordel.create({
      data: {
        annonsorId: parseInt(id),
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

    logger.info('Fordel opprettet for annonsør', { 
      userId: req.bruker!.id,
      annonsorId: id,
      fordelId: fordel.id
    });

    res.status(201).json(fordel);
  })
);

/**
 * @swagger
 * /annonsorer/{id}/click:
 *   post:
 *     summary: Registrer klikk på annonsør
 *     description: Registrerer et klikk på annonsør for statistikk
 *     tags: [Annonsører]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Annonsør ID
 *     responses:
 *       200:
 *         description: Klikk registrert vellykket
 *       404:
 *         description: Annonsør ikke funnet
 */
router.post('/:id/click', 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    logger.info('Registrerer klikk på annonsør', { annonsorId: id });

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

    logger.info('Klikk registrert', { annonsorId: id });

    res.json({ message: 'Klikk registrert' });
  })
);

export default router;
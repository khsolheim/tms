import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import logger, { auditLogDetailed } from "../utils/logger";
import { ApiError } from "../utils/ApiError";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     AnnonsorSponsor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         navn:
 *           type: string
 *         type:
 *           type: string
 *           enum: [ANNONSOR, SPONSOR]
 *         kontaktperson:
 *           type: string
 *         telefon:
 *           type: string
 *         epost:
 *           type: string
 *         nettside:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUSPENDED]
 *         aktiv:
 *           type: boolean
 *         startDato:
 *           type: string
 *           format: date-time
 *         sluttDato:
 *           type: string
 *           format: date-time
 *         budsjett:
 *           type: number
 *         kostnadPerVisning:
 *           type: number
 *         kostnadPerKlikk:
 *           type: number
 *
 *     Annonse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tittel:
 *           type: string
 *         innledning:
 *           type: string
 *         fullInnhold:
 *           type: string
 *         bildeUrl:
 *           type: string
 *         videoUrl:
 *           type: string
 *         ctaText:
 *           type: string
 *         ctaUrl:
 *           type: string
 *         ctaTelefon:
 *           type: string
 *         ctaEpost:
 *           type: string
 *         ctaVeibeskrivelse:
 *           type: string
 *         aktiv:
 *           type: boolean
 *         prioritet:
 *           type: integer
 *         maxVisninger:
 *           type: integer
 *         maxKlikk:
 *           type: integer
 *         startDato:
 *           type: string
 *           format: date-time
 *         sluttDato:
 *           type: string
 *           format: date-time
 */

// =============================================
// ANNONSØR/SPONSOR ROUTES
// =============================================

/**
 * @swagger
 * /api/annonsor/sponsorer:
 *   get:
 *     summary: Hent alle annonsører og sponsorer
 *     tags: [Annonsør/Sponsor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste over annonsører og sponsorer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnnonsorSponsor'
 */
router.get("/sponsorer", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bedriftId } = req.bruker!;
  const { type, status } = req.query;

  const where: any = { bedriftId, isDeleted: false };
  
  if (type) where.type = type;
  if (status) where.status = status;

  const sponsorer = await prisma.annonsorSponsor.findMany({
    where,
    include: {
      bedrift: true,
      annonser: {
        where: { isDeleted: false },
        include: {
          statistikk: {
            orderBy: { dato: 'desc' },
            take: 30 // Siste 30 dager
          }
        }
      }
    },
    orderBy: { opprettet: 'desc' }
  });

  res.json(sponsorer);
}));

/**
 * @swagger
 * /api/annonsor/sponsorer/{id}:
 *   get:
 *     summary: Hent spesifik annonsør/sponsor
 *     tags: [Annonsør/Sponsor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonsør/sponsor detaljer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnonsorSponsor'
 */
router.get("/sponsorer/:id", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { bedriftId } = req.bruker!;

  const sponsor = await prisma.annonsorSponsor.findFirst({
    where: { 
      id: parseInt(id), 
      bedriftId, 
      isDeleted: false 
    },
    include: {
      bedrift: true,
      annonser: {
        where: { isDeleted: false },
        include: {
          statistikk: {
            orderBy: { dato: 'desc' },
            take: 30
          },
          targeting: {
            include: {
              geografisk: true,
              skole: true
            }
          }
        }
      }
    }
  });

  if (!sponsor) {
    throw new ApiError(404, "Annonsør/sponsor ikke funnet");
  }

  res.json(sponsor);
}));

/**
 * @swagger
 * /api/annonsor/sponsorer:
 *   post:
 *     summary: Opprett ny annonsør/sponsor
 *     tags: [Annonsør/Sponsor]
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
 *               - type
 *               - startDato
 *             properties:
 *               navn:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ANNONSOR, SPONSOR]
 *               kontaktperson:
 *                 type: string
 *               telefon:
 *                 type: string
 *               epost:
 *                 type: string
 *               nettside:
 *                 type: string
 *               startDato:
 *                 type: string
 *                 format: date-time
 *               sluttDato:
 *                 type: string
 *                 format: date-time
 *               budsjett:
 *                 type: number
 *               kostnadPerVisning:
 *                 type: number
 *               kostnadPerKlikk:
 *                 type: number
 *     responses:
 *       201:
 *         description: Annonsør/sponsor opprettet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnonsorSponsor'
 */
router.post("/sponsorer", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bedriftId, id: brukerID } = req.bruker!;
  const {
    navn,
    type,
    kontaktperson,
    telefon,
    epost,
    nettside,
    startDato,
    sluttDato,
    budsjett,
    kostnadPerVisning,
    kostnadPerKlikk
  } = req.body;

  const sponsor = await prisma.annonsorSponsor.create({
    data: {
      bedriftId,
      navn,
      type,
      kontaktperson,
      telefon,
      epost,
      nettside,
      startDato: new Date(startDato),
      sluttDato: sluttDato ? new Date(sluttDato) : null,
      budsjett: budsjett ? parseFloat(budsjett) : null,
      kostnadPerVisning: kostnadPerVisning ? parseFloat(kostnadPerVisning) : null,
      kostnadPerKlikk: kostnadPerKlikk ? parseFloat(kostnadPerKlikk) : null
    },
    include: {
      bedrift: true
    }
  });

  await auditLog({
    userId: brukerID,
    action: 'CREATE',
    tableName: 'AnnonsorSponsor',
    recordId: sponsor.id,
    changes: sponsor,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json(sponsor);
}));

/**
 * @swagger
 * /api/annonsor/sponsorer/{id}:
 *   put:
 *     summary: Oppdater annonsør/sponsor
 *     tags: [Annonsør/Sponsor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               navn:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [ANNONSOR, SPONSOR]
 *               kontaktperson:
 *                 type: string
 *               telefon:
 *                 type: string
 *               epost:
 *                 type: string
 *               nettside:
 *                 type: string
 *               aktiv:
 *                 type: boolean
 *               startDato:
 *                 type: string
 *                 format: date-time
 *               sluttDato:
 *                 type: string
 *                 format: date-time
 *               budsjett:
 *                 type: number
 *               kostnadPerVisning:
 *                 type: number
 *               kostnadPerKlikk:
 *                 type: number
 *     responses:
 *       200:
 *         description: Annonsør/sponsor oppdatert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnnonsorSponsor'
 */
router.put("/sponsorer/:id", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { bedriftId, brukerID } = req.user!;
  const {
    navn,
    type,
    kontaktperson,
    telefon,
    epost,
    nettside,
    aktiv,
    startDato,
    sluttDato,
    budsjett,
    kostnadPerVisning,
    kostnadPerKlikk
  } = req.body;

  const eksisterendeSponsor = await prisma.annonsorSponsor.findFirst({
    where: { id: parseInt(id), bedriftId, isDeleted: false }
  });

  if (!eksisterendeSponsor) {
    throw new ApiError(404, "Annonsør/sponsor ikke funnet");
  }

  const oppdatertSponsor = await prisma.annonsorSponsor.update({
    where: { id: parseInt(id) },
    data: {
      navn,
      type,
      kontaktperson,
      telefon,
      epost,
      nettside,
      aktiv,
      startDato: startDato ? new Date(startDato) : undefined,
      sluttDato: sluttDato ? new Date(sluttDato) : null,
      budsjett: budsjett ? parseFloat(budsjett) : null,
      kostnadPerVisning: kostnadPerVisning ? parseFloat(kostnadPerVisning) : null,
      kostnadPerKlikk: kostnadPerKlikk ? parseFloat(kostnadPerKlikk) : null
    },
    include: {
      bedrift: true
    }
  });

  await auditLog({
    userId: brukerID,
    action: 'UPDATE',
    tableName: 'AnnonsorSponsor',
    recordId: oppdatertSponsor.id,
    changes: req.body,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json(oppdatertSponsor);
}));

/**
 * @swagger
 * /api/annonsor/sponsorer/{id}/godkjenn:
 *   post:
 *     summary: Godkjenn annonsør/sponsor
 *     tags: [Annonsør/Sponsor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonsør/sponsor godkjent
 */
router.post("/sponsorer/:id/godkjenn", verifyToken, sjekkRolle(['ADMIN']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { bedriftId, brukerID } = req.user!;

  const sponsor = await prisma.annonsorSponsor.update({
    where: { id: parseInt(id) },
    data: {
      status: 'APPROVED',
      godkjentAv: brukerID,
      godkjentDato: new Date()
    }
  });

  await auditLog({
    userId: brukerID,
    action: 'APPROVE',
    tableName: 'AnnonsorSponsor',
    recordId: sponsor.id,
    changes: { status: 'APPROVED' },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({ success: true, message: 'Annonsør/sponsor godkjent' });
}));

/**
 * @swagger
 * /api/annonsor/sponsorer/{id}/avvis:
 *   post:
 *     summary: Avvis annonsør/sponsor
 *     tags: [Annonsør/Sponsor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grunn:
 *                 type: string
 *     responses:
 *       200:
 *         description: Annonsør/sponsor avvist
 */
router.post("/sponsorer/:id/avvis", verifyToken, sjekkRolle(['ADMIN']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { grunn } = req.body;
  const { bedriftId, brukerID } = req.user!;

  const sponsor = await prisma.annonsorSponsor.update({
    where: { id: parseInt(id) },
    data: {
      status: 'REJECTED',
      avvistGrunn: grunn,
      godkjentAv: brukerID,
      godkjentDato: new Date()
    }
  });

  await auditLog({
    userId: brukerID,
    action: 'REJECT',
    tableName: 'AnnonsorSponsor',
    recordId: sponsor.id,
    changes: { status: 'REJECTED', avvistGrunn: grunn },
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json({ success: true, message: 'Annonsør/sponsor avvist' });
}));

// =============================================
// ANNONSE ROUTES
// =============================================

/**
 * @swagger
 * /api/annonsor/annonser:
 *   get:
 *     summary: Hent alle annonser
 *     tags: [Annonse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sponsorId
 *         schema:
 *           type: integer
 *         description: Filtrer etter sponsor
 *       - in: query
 *         name: aktiv
 *         schema:
 *           type: boolean
 *         description: Filtrer etter aktiv status
 *     responses:
 *       200:
 *         description: Liste over annonser
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annonse'
 */
router.get("/annonser", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bedriftId } = req.user!;
  const { sponsorId, aktiv } = req.query;

  const where: any = { 
    annonsor: { bedriftId },
    isDeleted: false 
  };
  
  if (sponsorId) where.annonsorId = parseInt(sponsorId as string);
  if (aktiv !== undefined) where.aktiv = aktiv === 'true';

  const annonser = await prisma.annonse.findMany({
    where,
    include: {
      annonsor: true,
      targeting: {
        include: {
          geografisk: true,
          skole: true
        }
      },
      statistikk: {
        orderBy: { dato: 'desc' },
        take: 30
      }
    },
    orderBy: { opprettet: 'desc' }
  });

  res.json(annonser);
}));

/**
 * @swagger
 * /api/annonsor/annonser/{id}:
 *   get:
 *     summary: Hent spesifik annonse
 *     tags: [Annonse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonse detaljer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annonse'
 */
router.get("/annonser/:id", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { bedriftId } = req.user!;

  const annonse = await prisma.annonse.findFirst({
    where: { 
      id: parseInt(id), 
      annonsor: { bedriftId },
      isDeleted: false 
    },
    include: {
      annonsor: true,
      targeting: {
        include: {
          geografisk: true,
          skole: true
        }
      },
      statistikk: {
        orderBy: { dato: 'desc' },
        take: 30
      },
      interaksjoner: {
        orderBy: { tidspunkt: 'desc' },
        take: 100,
        include: {
          elev: {
            select: {
              id: true,
              fornavn: true,
              etternavn: true,
              klassekode: true
            }
          }
        }
      }
    }
  });

  if (!annonse) {
    throw new ApiError(404, "Annonse ikke funnet");
  }

  res.json(annonse);
}));

/**
 * @swagger
 * /api/annonsor/annonser:
 *   post:
 *     summary: Opprett ny annonse
 *     tags: [Annonse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - annonsorId
 *               - tittel
 *               - innledning
 *               - startDato
 *             properties:
 *               annonsorId:
 *                 type: integer
 *               tittel:
 *                 type: string
 *               innledning:
 *                 type: string
 *               fullInnhold:
 *                 type: string
 *               bildeUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               ctaText:
 *                 type: string
 *               ctaUrl:
 *                 type: string
 *               ctaTelefon:
 *                 type: string
 *               ctaEpost:
 *                 type: string
 *               ctaVeibeskrivelse:
 *                 type: string
 *               prioritet:
 *                 type: integer
 *               maxVisninger:
 *                 type: integer
 *               maxKlikk:
 *                 type: integer
 *               startDato:
 *                 type: string
 *                 format: date-time
 *               sluttDato:
 *                 type: string
 *                 format: date-time
 *               targeting:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     geografiskId:
 *                       type: integer
 *                     spesifikkeSkoleId:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Annonse opprettet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annonse'
 */
router.post("/annonser", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bedriftId, brukerID } = req.user!;
  const {
    annonsorId,
    tittel,
    innledning,
    fullInnhold,
    bildeUrl,
    videoUrl,
    ctaText,
    ctaUrl,
    ctaTelefon,
    ctaEpost,
    ctaVeibeskrivelse,
    prioritet,
    maxVisninger,
    maxKlikk,
    startDato,
    sluttDato,
    targeting
  } = req.body;

  // Sjekk at annonsør tilhører bedrift
  const sponsor = await prisma.annonsorSponsor.findFirst({
    where: { id: annonsorId, bedriftId }
  });

  if (!sponsor) {
    throw new ApiError(404, "Annonsør ikke funnet");
  }

  const annonse = await prisma.annonse.create({
    data: {
      annonsorId,
      tittel,
      innledning,
      fullInnhold,
      bildeUrl,
      videoUrl,
      ctaText,
      ctaUrl,
      ctaTelefon,
      ctaEpost,
      ctaVeibeskrivelse,
      prioritet: prioritet || 1,
      maxVisninger: maxVisninger ? parseInt(maxVisninger) : null,
      maxKlikk: maxKlikk ? parseInt(maxKlikk) : null,
      startDato: new Date(startDato),
      sluttDato: sluttDato ? new Date(sluttDato) : null,
      targeting: targeting ? {
        create: targeting.map((t: any) => ({
          geografiskId: t.geografiskId,
          spesifikkeSkoleId: t.spesifikkeSkoleId
        }))
      } : undefined
    },
    include: {
      annonsor: true,
      targeting: {
        include: {
          geografisk: true,
          skole: true
        }
      }
    }
  });

  await auditLog({
    userId: brukerID,
    action: 'CREATE',
    tableName: 'Annonse',
    recordId: annonse.id,
    changes: annonse,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(201).json(annonse);
}));

/**
 * @swagger
 * /api/annonsor/annonser/{id}:
 *   put:
 *     summary: Oppdater annonse
 *     tags: [Annonse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tittel:
 *                 type: string
 *               innledning:
 *                 type: string
 *               fullInnhold:
 *                 type: string
 *               bildeUrl:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               ctaText:
 *                 type: string
 *               ctaUrl:
 *                 type: string
 *               ctaTelefon:
 *                 type: string
 *               ctaEpost:
 *                 type: string
 *               ctaVeibeskrivelse:
 *                 type: string
 *               aktiv:
 *                 type: boolean
 *               prioritet:
 *                 type: integer
 *               maxVisninger:
 *                 type: integer
 *               maxKlikk:
 *                 type: integer
 *               startDato:
 *                 type: string
 *                 format: date-time
 *               sluttDato:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Annonse oppdatert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annonse'
 */
router.put("/annonser/:id", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { bedriftId, brukerID } = req.user!;
  const {
    tittel,
    innledning,
    fullInnhold,
    bildeUrl,
    videoUrl,
    ctaText,
    ctaUrl,
    ctaTelefon,
    ctaEpost,
    ctaVeibeskrivelse,
    aktiv,
    prioritet,
    maxVisninger,
    maxKlikk,
    startDato,
    sluttDato
  } = req.body;

  const eksisterendeAnnonse = await prisma.annonse.findFirst({
    where: { 
      id: parseInt(id), 
      annonsor: { bedriftId },
      isDeleted: false 
    }
  });

  if (!eksisterendeAnnonse) {
    throw new ApiError(404, "Annonse ikke funnet");
  }

  const oppdatertAnnonse = await prisma.annonse.update({
    where: { id: parseInt(id) },
    data: {
      tittel,
      innledning,
      fullInnhold,
      bildeUrl,
      videoUrl,
      ctaText,
      ctaUrl,
      ctaTelefon,
      ctaEpost,
      ctaVeibeskrivelse,
      aktiv,
      prioritet,
      maxVisninger: maxVisninger ? parseInt(maxVisninger) : null,
      maxKlikk: maxKlikk ? parseInt(maxKlikk) : null,
      startDato: startDato ? new Date(startDato) : undefined,
      sluttDato: sluttDato ? new Date(sluttDato) : null
    },
    include: {
      annonsor: true,
      targeting: {
        include: {
          geografisk: true,
          skole: true
        }
      }
    }
  });

  await auditLog({
    userId: brukerID,
    action: 'UPDATE',
    tableName: 'Annonse',
    recordId: oppdatertAnnonse.id,
    changes: req.body,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.json(oppdatertAnnonse);
}));

/**
 * @swagger
 * /api/annonsor/annonser/{id}/statistikk:
 *   get:
 *     summary: Hent annonse statistikk
 *     tags: [Annonse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fradato
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: tildato
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Annonse statistikk
 */
router.get("/annonser/:id/statistikk", verifyToken, sjekkRolle(['ADMIN', 'INSTRUKTOR']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { fradate, tildate } = req.query;
  const { bedriftId } = req.user!;

  const annonse = await prisma.annonse.findFirst({
    where: { 
      id: parseInt(id), 
      annonsor: { bedriftId },
      isDeleted: false 
    }
  });

  if (!annonse) {
    throw new ApiError(404, "Annonse ikke funnet");
  }

  const where: any = { annonseId: parseInt(id) };
  
  if (fradate) where.dato = { gte: new Date(fradate as string) };
  if (tildate) where.dato = { ...where.dato, lte: new Date(tildate as string) };

  const statistikk = await prisma.annonseStatistikk.findMany({
    where,
    orderBy: { dato: 'desc' }
  });

  // Samlet statistikk
  const totalStats = {
    totalVisninger: statistikk.reduce((sum, stat) => sum + stat.antallVisninger, 0),
    totalKlikk: statistikk.reduce((sum, stat) => sum + stat.antallKlikk, 0),
    totalTelefonKlikk: statistikk.reduce((sum, stat) => sum + stat.antallTelefonKlikk, 0),
    totalEpostKlikk: statistikk.reduce((sum, stat) => sum + stat.antallEpostKlikk, 0),
    totalVeiKlikk: statistikk.reduce((sum, stat) => sum + stat.antallVeiKlikk, 0),
    clickThroughRate: 0,
    gjennomsnittVis: 0,
    gjennomsnittKlikk: 0
  };

  if (totalStats.totalVisninger > 0) {
    totalStats.clickThroughRate = (totalStats.totalKlikk / totalStats.totalVisninger) * 100;
  }

  if (statistikk.length > 0) {
    totalStats.gjennomsnittVis = totalStats.totalVisninger / statistikk.length;
    totalStats.gjennomsnittKlikk = totalStats.totalKlikk / statistikk.length;
  }

  res.json({
    statistikk,
    totalStats
  });
}));

// =============================================
// GEOGRAFISK ENHET ROUTES
// =============================================

/**
 * @swagger
 * /api/annonsor/geografisk:
 *   get:
 *     summary: Hent geografiske enheter
 *     tags: [Geografisk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [LAND, FYLKE, KOMMUNE, BYDEL, SKOLE]
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste over geografiske enheter
 */
router.get("/geografisk", verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { type, parentId } = req.query;

  const where: any = {};
  if (type) where.type = type;
  if (parentId) where.parentId = parseInt(parentId as string);

  const enheter = await prisma.geografiskEnhet.findMany({
    where,
    include: {
      parent: true,
      children: true
    },
    orderBy: { navn: 'asc' }
  });

  res.json(enheter);
}));

/**
 * @swagger
 * /api/annonsor/elev-annonser:
 *   get:
 *     summary: Hent annonser for elever (for fordeler-siden)
 *     tags: [Elev]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: elevId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste over annonser for elever
 */
router.get("/elev-annonser", verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { elevId } = req.query;

  if (!elevId) {
    throw new ApiError(400, "Elev ID er påkrevd");
  }

  // Hent elev informasjon
  const elev = await prisma.elev.findFirst({
    where: { id: parseInt(elevId as string) },
    include: { bedrift: true }
  });

  if (!elev) {
    throw new ApiError(404, "Elev ikke funnet");
  }

  // Finn relevante annonser basert på elevens postnummer og bedrift
  const annonser = await prisma.annonse.findMany({
    where: {
      aktiv: true,
      startDato: { lte: new Date() },
      OR: [
        { sluttDato: null },
        { sluttDato: { gte: new Date() } }
      ],
      annonsor: { 
        status: 'APPROVED',
        aktiv: true
      },
      targeting: {
        some: {
          OR: [
            { geografiskId: null }, // Hele landet
            { spesifikkeSkoleId: elev.bedriftId }, // Spesifikk skole
            {
              geografisk: {
                OR: [
                  { type: 'LAND' }, // Hele landet
                  { 
                    AND: [
                      { type: 'KOMMUNE' },
                      { kode: elev.postnummer.substring(0, 4) } // Matcher kommune basert på postnummer
                    ]
                  }
                ]
              }
            }
          ]
        }
      },
      isDeleted: false
    },
    include: {
      annonsor: true,
      targeting: {
        include: {
          geografisk: true,
          skole: true
        }
      }
    },
    orderBy: { prioritet: 'desc' }
  });

  res.json(annonser);
}));

/**
 * @swagger
 * /api/annonsor/registrer-interaksjon:
 *   post:
 *     summary: Registrer annonse interaksjon
 *     tags: [Interaksjon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - annonseId
 *               - interaksjonsType
 *             properties:
 *               annonseId:
 *                 type: integer
 *               elevId:
 *                 type: integer
 *               interaksjonsType:
 *                 type: string
 *                 enum: [VISNING, KLIKK, TELEFON, EPOST, VEIBESKRIVELSE, EKSPANDERT]
 *     responses:
 *       201:
 *         description: Interaksjon registrert
 */
router.post("/registrer-interaksjon", asyncHandler(async (req: Request, res: Response) => {
  const { annonseId, elevId, interaksjonsType } = req.body;

  // Registrer interaksjon
  const interaksjon = await prisma.annonseInteraksjon.create({
    data: {
      annonseId,
      elevId: elevId || null,
      interaksjonsType,
      ipAdresse: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer')
    }
  });

  // Oppdater daglig statistikk
  const idag = new Date();
  const dagensStatistikk = await prisma.annonseStatistikk.findUnique({
    where: {
      annonseId_dato: {
        annonseId,
        dato: idag
      }
    }
  });

  if (dagensStatistikk) {
    // Oppdater eksisterende statistikk
    const updateData: any = {};
    
    switch (interaksjonsType) {
      case 'VISNING':
        updateData.antallVisninger = { increment: 1 };
        break;
      case 'KLIKK':
        updateData.antallKlikk = { increment: 1 };
        break;
      case 'TELEFON':
        updateData.antallTelefonKlikk = { increment: 1 };
        break;
      case 'EPOST':
        updateData.antallEpostKlikk = { increment: 1 };
        break;
      case 'VEIBESKRIVELSE':
        updateData.antallVeiKlikk = { increment: 1 };
        break;
    }

    await prisma.annonseStatistikk.update({
      where: {
        annonseId_dato: {
          annonseId,
          dato: idag
        }
      },
      data: updateData
    });
  } else {
    // Opprett ny statistikk
    const initialData: any = {
      annonseId,
      dato: idag,
      antallVisninger: 0,
      antallKlikk: 0,
      antallTelefonKlikk: 0,
      antallEpostKlikk: 0,
      antallVeiKlikk: 0
    };

    switch (interaksjonsType) {
      case 'VISNING':
        initialData.antallVisninger = 1;
        break;
      case 'KLIKK':
        initialData.antallKlikk = 1;
        break;
      case 'TELEFON':
        initialData.antallTelefonKlikk = 1;
        break;
      case 'EPOST':
        initialData.antallEpostKlikk = 1;
        break;
      case 'VEIBESKRIVELSE':
        initialData.antallVeiKlikk = 1;
        break;
    }

    await prisma.annonseStatistikk.create({
      data: initialData
    });
  }

  res.status(201).json({ success: true });
}));

export default router;
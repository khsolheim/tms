import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, sjekkRolle, AuthRequest } from '../middleware/auth';
import logger, { auditLog } from '../utils/logger';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import {
  createSikkerhetskontrollSchema,
  updateSikkerhetskontrollSchema,
  deleteSikkerhetskontrollSchema,
  getSikkerhetskontrollByIdSchema,
  getSikkerhetskontrollerQuerySchema,
  registrerAvvikSchema,
  godkjennSjekkpunktSchema
} from '../validation/sikkerhetskontroll.validation';

const router = Router();
const prisma = new PrismaClient();

// Hent sikkerhetskontroller
router.get("/", 
  verifyToken, 
  validate(getSikkerhetskontrollerQuerySchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { bedriftId, kontrollmalId, status, limit, offset } = req.query as {
      bedriftId?: number;
      kontrollmalId?: number;
      status?: string;
      limit?: number;
      offset?: number;
    };

    // Hent brukerens bedrift
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      throw new ForbiddenError('Ingen tilgang');
    }

    // Bestem bedriftId (admin kan se andre bedrifter)
    const targetBedriftId = req.bruker!.rolle === 'ADMIN' && bedriftId ? bedriftId : bruker.bedriftId;

    logger.info('Henter sikkerhetskontroller', {
      userId: req.bruker!.id,
      bedriftId: targetBedriftId,
      kontrollmalId,
      status
    });

    const where: any = { bedriftId: targetBedriftId };
    if (kontrollmalId) where.basertPåMalId = kontrollmalId;
    if (status) where.status = status;

    const kontroller = await prisma.sikkerhetskontroll.findMany({
      where,
      include: {
        opprettetAv: true,
        punkter: {
          include: {
            sjekkpunkt: true
          }
        }
      },
      orderBy: { opprettet: 'desc' },
      take: limit || 50,
      skip: offset || 0
    });
    
    res.json(kontroller);
  })
);

// Opprett ny sikkerhetskontroll
router.post("/", 
  verifyToken, 
  validate(createSikkerhetskontrollSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { navn, beskrivelse, sjekkpunkter, kontrollmalId, bedriftId } = req.body;

    // Hent brukerens bedrift
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      throw new ForbiddenError('Ingen tilgang');
    }

    // Bestem bedriftId (admin kan opprette for andre bedrifter)
    const targetBedriftId = req.bruker!.rolle === 'ADMIN' && bedriftId ? bedriftId : bruker.bedriftId;

    logger.info('Oppretter ny sikkerhetskontroll', {
      navn,
      userId: req.bruker!.id,
      bedriftId: targetBedriftId,
      kontrollmalId
    });

    // Hvis basert på mal, hent mal-punktene
    let kontrollPunkter = sjekkpunkter || [];
    if (kontrollmalId) {
      const mal = await prisma.kontrollMal.findUnique({
        where: { id: kontrollmalId },
        include: {
          punkter: true
        }
      });

      if (mal) {
        kontrollPunkter = mal.punkter.map(p => ({
          sjekkpunktId: p.sjekkpunktId,
          rekkefølge: p.rekkefølge,
          kanGodkjennesAv: p.kanGodkjennesAv,
          påkrevd: p.påkrevd
        }));
      }
    }

    // Opprett sikkerhetskontroll
    const kontroll = await prisma.sikkerhetskontroll.create({
      data: {
        navn,
        beskrivelse,
        bedriftId: targetBedriftId,
        opprettetAvId: req.bruker!.id,
        basertPåMalId: kontrollmalId,
        punkter: {
          create: kontrollPunkter
        }
      },
      include: {
        opprettetAv: true,
        punkter: {
          include: {
            sjekkpunkt: true
          }
        }
      }
    });

    auditLog(
      req.bruker!.id,
      'CREATE_SIKKERHETSKONTROLL',
      'Sikkerhetskontroll',
      {
        kontrollId: kontroll.id,
        navn: kontroll.navn,
        bedriftId: targetBedriftId
      }
    );

    logger.info('Sikkerhetskontroll opprettet vellykket', {
      kontrollId: kontroll.id,
      bedriftId: targetBedriftId
    });

    res.status(201).json(kontroll);
  })
);

// Hent spesifikk sikkerhetskontroll
router.get("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    // Hent brukerens bedrift
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      res.status(403).json({ error: "Ingen tilgang" });
      return;
    }

    const kontroll = await prisma.sikkerhetskontroll.findFirst({
      where: { 
        id: parseInt(id),
        bedriftId: bruker.bedriftId
      },
      include: {
        opprettetAv: true,
        punkter: {
          include: {
            sjekkpunkt: true
          },
          orderBy: {
            rekkefølge: 'asc'
          }
        }
      }
    });

    if (!kontroll) {
      res.status(404).json({ error: "Sikkerhetskontroll ikke funnet" });
      return;
    }

    res.json(kontroll);
  } catch (error) {
    console.error('Feil ved henting av sikkerhetskontroll:', error);
    res.status(500).json({ error: "Kunne ikke hente sikkerhetskontroll" });
  }
});

// Oppdater sikkerhetskontroll
router.put("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { navn, beskrivelse, aktiv, punkter } = req.body;
  
  try {
    // Hent brukerens bedrift
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      res.status(403).json({ error: "Ingen tilgang" });
      return;
    }

    // Sjekk at kontroll tilhører brukerens bedrift
    const eksisterende = await prisma.sikkerhetskontroll.findFirst({
      where: {
        id: parseInt(id),
        bedriftId: bruker.bedriftId
      }
    });

    if (!eksisterende) {
      res.status(404).json({ error: "Sikkerhetskontroll ikke funnet" });
      return;
    }

    // Oppdater sikkerhetskontroll og punkter i en transaksjon
    const oppdatert = await prisma.$transaction(async (tx) => {
      // Oppdater hovedinfo
      const kontroll = await tx.sikkerhetskontroll.update({
        where: { id: parseInt(id) },
        data: {
          navn,
          beskrivelse,
          aktiv
        }
      });

      // Hvis punkter er inkludert, oppdater dem
      if (punkter && Array.isArray(punkter)) {
        // Slett eksisterende punkter
        await tx.sikkerhetskontrollPunkt.deleteMany({
          where: { sikkerhetskontrollId: parseInt(id) }
        });

        // Legg til nye punkter
        await tx.sikkerhetskontrollPunkt.createMany({
          data: punkter.map((p: any) => ({
            sikkerhetskontrollId: parseInt(id),
            sjekkpunktId: p.sjekkpunktId,
            rekkefølge: p.rekkefølge,
            kanGodkjennesAv: p.kanGodkjennesAv,
            påkrevd: p.påkrevd
          }))
        });
      }

      // Hent oppdatert kontroll med relasjoner
      return await tx.sikkerhetskontroll.findUnique({
        where: { id: parseInt(id) },
        include: {
          opprettetAv: true,
          punkter: {
            include: {
              sjekkpunkt: true
            },
            orderBy: {
              rekkefølge: 'asc'
            }
          }
        }
      });
    });

    res.json(oppdatert);
  } catch (error) {
    console.error('Feil ved oppdatering av sikkerhetskontroll:', error);
    res.status(500).json({ error: "Kunne ikke oppdatere sikkerhetskontroll" });
  }
});

// Slett sikkerhetskontroll
router.delete("/:id", verifyToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  try {
    // Hent brukerens bedrift og rolle
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      res.status(403).json({ error: "Ingen tilgang" });
      return;
    }

    // Sjekk at kontroll tilhører brukerens bedrift
    const kontroll = await prisma.sikkerhetskontroll.findFirst({
      where: {
        id: parseInt(id),
        bedriftId: bruker.bedriftId
      }
    });

    if (!kontroll) {
      res.status(404).json({ error: "Sikkerhetskontroll ikke funnet" });
      return;
    }

    // Kun admin eller oppretteren kan slette
    if (bruker.rolle !== 'ADMIN' && bruker.rolle !== 'HOVEDBRUKER' && kontroll.opprettetAvId !== req.bruker!.id) {
      res.status(403).json({ error: "Ikke tilgang til å slette denne kontrollen" });
      return;
    }

    // Slett kontrollen (punktene slettes automatisk pga cascade)
    await prisma.sikkerhetskontroll.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Feil ved sletting av sikkerhetskontroll:', error);
    res.status(500).json({ error: "Kunne ikke slette sikkerhetskontroll" });
  }
});

export default router; 
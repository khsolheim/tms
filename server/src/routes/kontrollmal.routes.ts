import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  getKontrollMalerSchema,
  getKontrollMalSchema,
  opprettKontrollMalSchema,
  kopierKontrollMalSchema,
  oppdaterKontrollMalSchema,
  slettKontrollMalSchema
} from "../validation/kontrollmal.validation";
import { AppError, ValidationError, NotFoundError } from "../utils/errors";
import logger from "../utils/logger";

const router = Router();
const prisma = new PrismaClient();

// Hent alle kontrollmaler
router.get("/", verifyToken, validate(getKontrollMalerSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { kategori, offentlig, tags, opprettetAvId } = req.query;
    
    const where: any = {};
    
    // Filtrer basert på query parameters
    if (kategori) {
      where.kategori = kategori;
    }
    
    if (offentlig !== undefined) {
      where.offentlig = offentlig === 'true';
    }
    
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        hasSome: tagsArray
      };
    }
    
    if (opprettetAvId) {
      where.opprettetAvId = parseInt(opprettetAvId as string);
    }
    
    const kontrollMaler = await prisma.kontrollMal.findMany({
      where,
      include: {
        opprettetAv: true,
        punkter: {
          include: {
            sjekkpunkt: true
          }
        }
      },
      orderBy: {
        opprettet: 'desc'
      }
    });

    logger.info('Hentet kontrollmaler', {
      userId: req.bruker?.id,
      count: kontrollMaler.length,
      filters: { kategori, offentlig, tags, opprettetAvId }
    });
    
    res.json(kontrollMaler);
  } catch (error) {
    logger.error('Feil ved henting av kontrollmaler', {
      userId: req.bruker?.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke hente kontrollmaler", 500, 'GET_KONTROLLMALER_ERROR');
  }
});

// Opprett ny kontrollmal
router.post("/", verifyToken, sjekkRolle(['ADMIN']), validate(opprettKontrollMalSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { navn, beskrivelse, kategori, tags, offentlig, punkter } = req.body;
    
    const kontrollMal = await prisma.kontrollMal.create({
      data: {
        navn,
        beskrivelse,
        kategori,
        tags: tags || [],
        offentlig: offentlig !== false,
        opprettetAvId: req.bruker!.id,
        punkter: {
          create: punkter.map((punkt: any, index: number) => ({
            sjekkpunktId: punkt.sjekkpunktId,
            rekkefølge: punkt.rekkefølge || index + 1,
            kanGodkjennesAv: punkt.kanGodkjennesAv || 'LAERER',
            påkrevd: punkt.påkrevd !== false
          }))
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

    logger.info('Opprettet kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId: kontrollMal.id,
      navn,
      kategori,
      antallPunkter: punkter.length
    });
    
    res.status(201).json(kontrollMal);
  } catch (error) {
    logger.error('Feil ved opprettelse av kontrollmal', {
      userId: req.bruker?.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke opprette kontrollmal", 500, 'CREATE_KONTROLLMAL_ERROR');
  }
});

// Hent spesifikk kontrollmal
router.get("/:id", verifyToken, validate(getKontrollMalSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kontrollMalId = Number(req.params.id);
    
    const kontrollMal = await prisma.kontrollMal.findUnique({
      where: { id: kontrollMalId },
      include: {
        opprettetAv: true,
        punkter: {
          include: {
            sjekkpunkt: true
          },
          orderBy: {
            rekkefølge: 'asc'
          }
        },
        kopierteTil: {
          include: {
            bedrift: true
          }
        }
      }
    });
    
    if (!kontrollMal) {
      throw new NotFoundError("Kontrollmal");
    }
    
    // Øk bruktAntall
    await prisma.kontrollMal.update({
      where: { id: kontrollMalId },
      data: { bruktAntall: { increment: 1 } }
    });

    logger.info('Hentet kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId,
      navn: kontrollMal.navn
    });
    
    res.json(kontrollMal);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Feil ved henting av kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke hente kontrollmal", 500, 'GET_KONTROLLMAL_ERROR');
  }
});

// Kopier kontrollmal til sikkerhetskontroll
router.post("/:id/kopier", verifyToken, validate(kopierKontrollMalSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kontrollMalId = Number(req.params.id);
    const { navn, beskrivelse, bedriftId } = req.body;
    
    // Hent kontrollmal med punkter
    const kontrollMal = await prisma.kontrollMal.findUnique({
      where: { id: kontrollMalId },
      include: {
        punkter: true
      }
    });
    
    if (!kontrollMal) {
      throw new NotFoundError("Kontrollmal");
    }
    
    // Sjekk tilgang til bedrift
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new AppError("Ikke tilgang til denne bedriften", 403, 'ACCESS_DENIED');
    }
    
    // Opprett sikkerhetskontroll basert på mal
    const sikkerhetskontroll = await prisma.sikkerhetskontroll.create({
      data: {
        navn,
        beskrivelse: beskrivelse || kontrollMal.beskrivelse,
        bedriftId,
        opprettetAvId: req.bruker!.id,
        basertPåMalId: kontrollMalId,
        punkter: {
          create: kontrollMal.punkter.map(punkt => ({
            sjekkpunktId: punkt.sjekkpunktId,
            rekkefølge: punkt.rekkefølge,
            kanGodkjennesAv: punkt.kanGodkjennesAv,
            påkrevd: punkt.påkrevd
          }))
        }
      },
      include: {
        bedrift: true,
        opprettetAv: true,
        basertPåMal: true,
        punkter: {
          include: {
            sjekkpunkt: true
          }
        }
      }
    });
    
    // Øk bruktAntall på malen
    await prisma.kontrollMal.update({
      where: { id: kontrollMalId },
      data: { bruktAntall: { increment: 1 } }
    });

    logger.info('Kopierte kontrollmal til sikkerhetskontroll', {
      userId: req.bruker?.id,
      kontrollMalId,
      sikkerhetskontrollId: sikkerhetskontroll.id,
      bedriftId,
      navn
    });
    
    res.status(201).json(sikkerhetskontroll);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AppError) {
      throw error;
    }
    logger.error('Feil ved kopiering av kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke kopiere kontrollmal", 500, 'COPY_KONTROLLMAL_ERROR');
  }
});

// Oppdater kontrollmal
router.put("/:id", verifyToken, sjekkRolle(['ADMIN']), validate(oppdaterKontrollMalSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kontrollMalId = Number(req.params.id);
    const { navn, beskrivelse, kategori, tags, offentlig, aktiv, punkter } = req.body;
    
    // Hent eksisterende mal for å sjekke eierskap
    const eksisterendeMal = await prisma.kontrollMal.findUnique({
      where: { id: kontrollMalId }
    });
    
    if (!eksisterendeMal) {
      throw new NotFoundError("Kontrollmal");
    }
    
    // Kun admin eller eier kan oppdatere
    if (req.bruker!.rolle !== 'ADMIN' && eksisterendeMal.opprettetAvId !== req.bruker!.id) {
      throw new AppError("Ikke tilgang til å oppdatere denne malen", 403, 'ACCESS_DENIED');
    }
    
    // Start transaksjon for å oppdatere mal og punkter
    const oppdatertMal = await prisma.$transaction(async (tx) => {
      // Slett eksisterende punkter hvis nye punkter er oppgitt
      if (Array.isArray(punkter)) {
        await tx.kontrollMalPunkt.deleteMany({
          where: { kontrollMalId }
        });
      }
      
      // Oppdater mal
      return await tx.kontrollMal.update({
        where: { id: kontrollMalId },
        data: {
          navn,
          beskrivelse,
          kategori,
          tags: tags || [],
          offentlig,
          aktiv,
          // Opprett nye punkter hvis oppgitt
          ...(Array.isArray(punkter) && {
            punkter: {
              create: punkter.map((punkt: any, index: number) => ({
                sjekkpunktId: punkt.sjekkpunktId,
                rekkefølge: punkt.rekkefølge || index + 1,
                kanGodkjennesAv: punkt.kanGodkjennesAv || 'LAERER',
                påkrevd: punkt.påkrevd !== false
              }))
            }
          })
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
    });

    logger.info('Oppdaterte kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId,
      endringer: { navn, beskrivelse, kategori, tags, offentlig, aktiv },
      antallPunkter: punkter?.length
    });
    
    res.json(oppdatertMal);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AppError) {
      throw error;
    }
    logger.error('Feil ved oppdatering av kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke oppdatere kontrollmal", 500, 'UPDATE_KONTROLLMAL_ERROR');
  }
});

// Slett kontrollmal
router.delete("/:id", verifyToken, sjekkRolle(['ADMIN']), validate(slettKontrollMalSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const kontrollMalId = Number(req.params.id);
    
    // Hent mal for å sjekke eierskap
    const mal = await prisma.kontrollMal.findUnique({
      where: { id: kontrollMalId }
    });
    
    if (!mal) {
      throw new NotFoundError("Kontrollmal");
    }
    
    // Kun admin eller eier kan slette
    if (req.bruker!.rolle !== 'ADMIN' && mal.opprettetAvId !== req.bruker!.id) {
      throw new AppError("Ikke tilgang til å slette denne malen", 403, 'ACCESS_DENIED');
    }
    
    // Slett mal (punkter slettes automatisk pga cascade)
    await prisma.kontrollMal.delete({
      where: { id: kontrollMalId }
    });

    logger.info('Slettet kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId,
      navn: mal.navn
    });
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof AppError) {
      throw error;
    }
    logger.error('Feil ved sletting av kontrollmal', {
      userId: req.bruker?.id,
      kontrollMalId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke slette kontrollmal", 500, 'DELETE_KONTROLLMAL_ERROR');
  }
});

export default router; 
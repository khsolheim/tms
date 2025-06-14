import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, sjekkRolle, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getSjekkpunkterSchema,
  getSjekkpunktSchema,
  opprettSjekkpunktSchema,
  oppdaterSjekkpunktSchema,
  slettSjekkpunktSchema
} from '../validation/sjekkpunkt.validation';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Hent sjekkpunkter
router.get("/", verifyToken, validate(getSjekkpunkterSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { system, sok, typeKontroll } = req.query;
    
    const where: any = {};
    if (system) {
      where.system = system as string;
    }
    if (typeKontroll) {
      where.typeKontroll = typeKontroll as string;
    }
    if (sok) {
      where.OR = [
        { tittel: { contains: sok as string, mode: 'insensitive' } },
        { beskrivelse: { contains: sok as string, mode: 'insensitive' } }
      ];
    }
    
    const sjekkpunkter = await prisma.sjekkpunkt.findMany({
      where,
      orderBy: { tittel: 'asc' }
    });

    logger.info('Hentet sjekkpunkter', {
      userId: req.bruker?.id,
      count: sjekkpunkter.length,
      filters: { system, sok, typeKontroll }
    });
    
    res.json(sjekkpunkter);
  } catch (error) {
    logger.error('Feil ved henting av sjekkpunkter', {
      userId: req.bruker?.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke hente sjekkpunkter", 500, 'GET_SJEKKPUNKTER_ERROR');
  }
});

// Opprett nytt sjekkpunkt
router.post("/", verifyToken, sjekkRolle(['ADMIN']), validate(opprettSjekkpunktSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tittel, beskrivelse, system, typeKontroll, bildeUrl, videoUrl, rettVerdi, 
            intervallKm, intervallTid, forerkortklass, konsekvens } = req.body;
    
    const sjekkpunkt = await prisma.sjekkpunkt.create({
      data: {
        tittel,
        beskrivelse,
        system,
        typeKontroll,
        bildeUrl: bildeUrl || null,
        videoUrl: videoUrl || null,
        rettVerdi: rettVerdi || null,
        intervallKm: intervallKm || null,
        intervallTid: intervallTid || null,
        forerkortklass: forerkortklass || [],
        konsekvens: konsekvens || []
      }
    });

    logger.info('Opprettet sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId: sjekkpunkt.id,
      tittel,
      system,
      typeKontroll
    });
    
    res.status(201).json(sjekkpunkt);
  } catch (error) {
    logger.error('Feil ved oppretting av sjekkpunkt', {
      userId: req.bruker?.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke opprette sjekkpunkt", 500, 'CREATE_SJEKKPUNKT_ERROR');
  }
});

// Hent spesifikt sjekkpunkt
router.get("/:id", verifyToken, validate(getSjekkpunktSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sjekkpunktId = Number(req.params.id);
    
    const sjekkpunkt = await prisma.sjekkpunkt.findUnique({
      where: { id: sjekkpunktId }
    });
    
    if (!sjekkpunkt) {
      throw new NotFoundError("Sjekkpunkt");
    }

    logger.info('Hentet sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId,
      tittel: sjekkpunkt.tittel
    });
    
    res.json(sjekkpunkt);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Feil ved henting av sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke hente sjekkpunkt", 500, 'GET_SJEKKPUNKT_ERROR');
  }
});

// Oppdater sjekkpunkt
router.put("/:id", verifyToken, sjekkRolle(['ADMIN']), validate(oppdaterSjekkpunktSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sjekkpunktId = Number(req.params.id);
    const { tittel, beskrivelse, system, typeKontroll, bildeUrl, videoUrl, rettVerdi,
            intervallKm, intervallTid, forerkortklass, konsekvens } = req.body;
    
    // Sjekk om sjekkpunktet eksisterer
    const eksisterendeSjekkpunkt = await prisma.sjekkpunkt.findUnique({
      where: { id: sjekkpunktId }
    });
    
    if (!eksisterendeSjekkpunkt) {
      throw new NotFoundError("Sjekkpunkt");
    }
    
    const sjekkpunkt = await prisma.sjekkpunkt.update({
      where: { id: sjekkpunktId },
      data: {
        tittel,
        beskrivelse,
        system,
        typeKontroll,
        bildeUrl,
        videoUrl,
        rettVerdi,
        intervallKm,
        intervallTid,
        forerkortklass,
        konsekvens
      }
    });

    logger.info('Oppdaterte sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId,
      endringer: { tittel, beskrivelse, system, typeKontroll }
    });
    
    res.json(sjekkpunkt);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Feil ved oppdatering av sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke oppdatere sjekkpunkt", 500, 'UPDATE_SJEKKPUNKT_ERROR');
  }
});

// Slett sjekkpunkt
router.delete("/:id", verifyToken, sjekkRolle(['ADMIN']), validate(slettSjekkpunktSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sjekkpunktId = Number(req.params.id);
    
    // Sjekk om sjekkpunktet er i bruk
    const sjekkpunkt = await prisma.sjekkpunkt.findUnique({
      where: { id: sjekkpunktId },
      include: {
        _count: {
          select: {
            kontrollPunkter: true,
            malPunkter: true
          }
        }
      }
    });
    
    if (!sjekkpunkt) {
      throw new NotFoundError("Sjekkpunkt");
    }
    
    if (sjekkpunkt._count.kontrollPunkter > 0 || sjekkpunkt._count.malPunkter > 0) {
      throw new ConflictError("Kan ikke slette sjekkpunkt som er i bruk");
    }
    
    await prisma.sjekkpunkt.delete({
      where: { id: sjekkpunktId }
    });

    logger.info('Slettet sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId,
      tittel: sjekkpunkt.tittel
    });
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }
    logger.error('Feil ved sletting av sjekkpunkt', {
      userId: req.bruker?.id,
      sjekkpunktId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke slette sjekkpunkt", 500, 'DELETE_SJEKKPUNKT_ERROR');
  }
});

export default router; 
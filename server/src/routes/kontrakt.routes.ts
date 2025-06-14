import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import logger, { auditLog } from '../utils/logger';
import { 
  kontraktOpprettSchema, 
  kontraktOppdaterSchema,
  getKontraktSchema,
  deleteKontraktSchema
} from '../validation/kontrakt.validation';
import { KontraktService } from '../services/kontrakt.service';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const kontraktService = new KontraktService(prisma);

// Hent alle kontrakter for brukerens bedrift
router.get("/", 
  verifyToken, 
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { page, limit, status, elevNavn } = req.query;
    
    logger.info('Henter kontrakter for bedrift', {
      bedriftId: req.bruker!.bedriftId,
      userId: req.bruker!.id
    });

    const resultat = await kontraktService.hentKontrakter({
      bedriftId: req.bruker!.bedriftId!,
      status: status as string,
      elevNavn: elevNavn as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.json(resultat);
  })
);

// Hent spesifikk kontrakt
router.get("/:id", 
  verifyToken, 
  validate(getKontraktSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const kontraktId = parseInt(req.params.id);
    
    logger.info('Henter kontrakt', {
      kontraktId,
      bedriftId: req.bruker!.bedriftId,
      userId: req.bruker!.id
    });

    const kontrakt = await kontraktService.hentKontrakt(
      kontraktId, 
      req.bruker!.bedriftId!
    );

    res.json(kontrakt);
  })
);

// Opprett ny kontrakt
router.post("/", 
  verifyToken, 
  validate(kontraktOpprettSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.info('Oppretter ny kontrakt', {
      bedriftId: req.bruker!.bedriftId,
      userId: req.bruker!.id,
      elevPersonnummer: req.body.elevPersonnummer
    });

    const kontraktData = {
      ...req.body,
      bedriftId: req.bruker!.bedriftId!,
      opprettetAv: req.bruker!.id
    };

    const kontrakt = await kontraktService.opprettKontrakt(kontraktData);

    auditLog(
      req.bruker!.id,
      'CREATE_KONTRAKT',
      'Kontrakt',
      {
        kontraktId: kontrakt.id,
        bedriftId: req.bruker!.bedriftId,
        elevPersonnummer: req.body.elevPersonnummer
      }
    );

    logger.info('Kontrakt opprettet vellykket', { 
      kontraktId: kontrakt.id 
    });

    res.status(201).json(kontrakt);
  })
);

// Oppdater kontrakt
router.put("/:id", 
  verifyToken, 
  validate(kontraktOppdaterSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const kontraktId = parseInt(req.params.id);
    
    logger.info('Oppdaterer kontrakt', {
      kontraktId,
      bedriftId: req.bruker!.bedriftId,
      userId: req.bruker!.id
    });

    const oppdatertKontrakt = await kontraktService.oppdaterKontrakt(
      kontraktId,
      req.bruker!.bedriftId!,
      req.body
    );

    auditLog(
      req.bruker!.id,
      'UPDATE_KONTRAKT',
      'Kontrakt',
      {
        kontraktId,
        endringer: req.body
      }
    );

    logger.info('Kontrakt oppdatert', { kontraktId });

    res.json(oppdatertKontrakt);
  })
);

// Slett kontrakt
router.delete("/:id", 
  verifyToken, 
  validate(deleteKontraktSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const kontraktId = parseInt(req.params.id);
    
    logger.info('Sletter kontrakt', {
      kontraktId,
      bedriftId: req.bruker!.bedriftId,
      userId: req.bruker!.id
    });

    await kontraktService.slettKontrakt(
      kontraktId, 
      req.bruker!.bedriftId!
    );

    auditLog(
      req.bruker!.id,
      'DELETE_KONTRAKT',
      'Kontrakt',
      { kontraktId }
    );

    logger.info('Kontrakt slettet', { kontraktId });

    res.json({ success: true });
  })
);

// Hent kontrakt-statistikk
router.get("/stats/oversikt", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.info('Henter kontraktstatistikk', {
      bedriftId: req.bruker!.bedriftId,
      userId: req.bruker!.id
    });

    const statistikk = await kontraktService.hentKontraktsstatistikk(
      req.bruker!.bedriftId!
    );

    res.json(statistikk);
  })
);

export default router; 
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, sjekkRolle, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import logger, { auditLog } from '../utils/logger';
import { ForbiddenError } from '../utils/errors';
import {
  hentSystemconfigSchema,
  oppdaterSystemconfigSchema
} from '../validation/systemconfig.validation';

const router = Router();
const prisma = new PrismaClient();

// Hent systemkonfigurasjon for brukerens bedrift
router.get("/", 
  verifyToken,
  validate(hentSystemconfigSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    // Hent brukerens bedrift
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      throw new ForbiddenError('Ingen tilgang');
    }

    logger.info('Henter systemkonfigurasjon', {
      userId: req.bruker!.id,
      bedriftId: bruker.bedriftId
    });

    const config = await prisma.systemConfig.findFirst({
      where: { bedriftId: bruker.bedriftId }
    });

    res.json(config || null);
  })
);

// Oppdater systemkonfigurasjon
router.put("/", 
  verifyToken,
  validate(oppdaterSystemconfigSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    // Hent brukerens bedrift
    const bruker = await prisma.ansatt.findUnique({
      where: { id: req.bruker!.id },
      select: { bedriftId: true, rolle: true }
    });

    if (!bruker || !bruker.bedriftId) {
      throw new ForbiddenError('Ingen tilgang');
    }

    logger.info('Oppdaterer systemkonfigurasjon', {
      userId: req.bruker!.id,
      bedriftId: bruker.bedriftId,
      endringer: req.body
    });

    // Sjekk om konfigurasjon eksisterer
    const eksisterende = await prisma.systemConfig.findFirst({
      where: { bedriftId: bruker.bedriftId }
    });

    const config = eksisterende
      ? await prisma.systemConfig.update({
          where: { id: eksisterende.id },
          data: { ...req.body }
        })
      : await prisma.systemConfig.create({
          data: {
            ...req.body,
            bedriftId: bruker.bedriftId
          }
        });

    auditLog(
      req.bruker!.id,
      'UPDATE_SYSTEM_CONFIG',
      'SystemConfig',
      {
        bedriftId: bruker.bedriftId,
        operation: eksisterende ? 'UPDATE' : 'CREATE',
        changes: req.body
      }
    );

    res.json(config);
  })
);

export default router; 
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import logger, { auditLog } from "../utils/logger";
import { NotFoundError } from "../utils/errors";
import {
  hentAllebBrukereSchema,
  oppdaterTilgangerSchema
} from "../validation/brukere.validation";

const router = Router();
const prisma = new PrismaClient();

// Hent alle brukere (kun for admin)
router.get("/", 
  verifyToken, 
  sjekkRolle(['ADMIN']),
  validate(hentAllebBrukereSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    logger.info('Admin henter alle brukere', { adminId: req.bruker!.id });

    const users = await prisma.ansatt.findMany({
      select: {
        id: true,
        fornavn: true,
        etternavn: true,
        epost: true,
        rolle: true,
        tilganger: true,
        bedriftId: true,
        telefon: true,
        adresse: true,
        postnummer: true,
        poststed: true,
        klasser: true,
        kjøretøy: true,
        hovedkjøretøy: true,
        bedrift: {
          select: {
            id: true,
            navn: true
          }
        }
      }
    });

    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      ...user,
      navn: `${user.fornavn} ${user.etternavn}`
    }));

    res.json(transformedUsers);
  })
);

// Oppdater tilganger for bruker
router.put("/:id/tilganger", 
  verifyToken, 
  sjekkRolle(['ADMIN']),
  validate(oppdaterTilgangerSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { tilganger } = req.body;
    const userId = req.params.id as unknown as number; // Validert av schema

    logger.info('Admin oppdaterer tilganger', {
      adminId: req.bruker!.id,
      targetUserId: userId,
      newTilganger: tilganger
    });

    // Sjekk om bruker eksisterer
    const eksisterendeBruker = await prisma.ansatt.findUnique({
      where: { id: userId }
    });

    if (!eksisterendeBruker) {
      throw new NotFoundError('Bruker', userId);
    }

    const user = await prisma.ansatt.update({
      where: { id: userId },
      data: {
        tilganger,
        oppdatert: new Date()
      },
      select: {
        id: true,
        fornavn: true,
        etternavn: true,
        epost: true,
        rolle: true,
        tilganger: true,
        bedriftId: true,
        telefon: true,
        adresse: true,
        postnummer: true,
        poststed: true,
        klasser: true,
        kjøretøy: true,
        hovedkjøretøy: true,
        bedrift: {
          select: {
            id: true,
            navn: true
          }
        }
      }
    });

    auditLog(
      req.bruker!.id,
      'UPDATE_USER_PERMISSIONS',
      'Ansatt',
      {
        targetUserId: userId,
        oldTilganger: eksisterendeBruker.tilganger,
        newTilganger: tilganger
      }
    );

    // Transform data to match frontend expectations
    const transformedUser = {
      ...user,
      navn: `${user.fornavn} ${user.etternavn}`
    };

    res.json(transformedUser);
  })
);

export default router; 
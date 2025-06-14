import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import logger, { auditLog } from "../utils/logger";
import { ApiError } from "../utils/ApiError";
import {
  loggInnSchema,
  impersonerBrukerSchema,
  stoppImpersoneringSchema
} from "../validation/auth.validation";

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - epost
 *         - passord
 *       properties:
 *         epost:
 *           type: string
 *           format: email
 *           description: Ansatt sin e-postadresse
 *           example: admin@example.com
 *         passord:
 *           type: string
 *           format: password
 *           description: Ansatt sitt passord
 *           example: "SecurePassword123!"
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique user identifier
 *           example: 1
 *         navn:
 *           type: string
 *           description: Full name of the user
 *           example: "John Doe"
 *         epost:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: john.doe@example.com
 *         rolle:
 *           type: string
 *           enum: [ADMIN, INSTRUKTØR, ELEV]
 *           description: User role in the system
 *           example: ADMIN
 *         tilganger:
 *           type: array
 *           items:
 *             type: string
 *           description: User permissions
 *           example: ["READ_USERS", "WRITE_USERS"]
 *         bedrift:
 *           $ref: '#/components/schemas/Company'
 *         bedriftId:
 *           type: integer
 *           description: Company identifier
 *           example: 1
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         bruker:
 *           $ref: '#/components/schemas/User'
 *         isImpersonating:
 *           type: boolean
 *           description: Whether user is impersonating another user
 *           example: false
 */

/**
 * @swagger
 * /auth/logg-inn:
 *   post:
 *     summary: User authentication
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ugyldig påloggingsinformasjon"
 *                 requestId:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 */
// Logg inn
router.post("/logg-inn", 
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { epost, passord } = req.body;

    logger.info('Innloggingsforsøk', { epost });

    const ansatt = await prisma.ansatt.findUnique({
      where: { epost },
      include: { bedrift: true }
    });

    if (!ansatt) {
      logger.warn('Innloggingsforsøk med ukjent e-post', { epost });
      throw ApiError.unauthorized('Ugyldig påloggingsinformasjon');
    }

    const gyldigPassord = await bcrypt.compare(passord, ansatt.passordHash);
    if (!gyldigPassord) {
      logger.warn('Innloggingsforsøk med feil passord', { 
        userId: ansatt.id,
        epost: ansatt.epost 
      });
      throw ApiError.unauthorized('Ugyldig påloggingsinformasjon');
    }

    // Generer JWT token
    const token = jwt.sign(
      {
        id: ansatt.id,
        epost: ansatt.epost,
        rolle: ansatt.rolle,
        bedriftId: ansatt.bedriftId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    auditLog(ansatt.id, 'SUCCESSFUL_LOGIN', 'Auth', { epost });

    logger.info('Innlogging vellykket', {
      userId: ansatt.id,
      epost: ansatt.epost,
      rolle: ansatt.rolle
    });

    res.json({
      token,
      bruker: {
        id: ansatt.id,
        navn: `${ansatt.fornavn} ${ansatt.etternavn}`,
        epost: ansatt.epost,
        rolle: ansatt.rolle,
        tilganger: ansatt.tilganger,
        bedrift: ansatt.bedrift,
        bedriftId: ansatt.bedriftId
      }
    });
  })
);

// Impersonering (admin-funksjon)
router.post("/impersonate/:id", 
  verifyToken, 
  sjekkRolle(['ADMIN']), 
  validate(impersonerBrukerSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const targetUserId = req.params.id as unknown as number; // Validert og transformert av schema

    logger.info('Admin starter impersonering', {
      adminId: req.bruker!.id,
      targetUserId
    });

    const targetUser = await prisma.ansatt.findUnique({
      where: { id: targetUserId },
      include: { bedrift: true }
    });

    if (!targetUser) {
      throw ApiError.notFound('Bruker', targetUserId);
    }

    // Lagre admin brukerens ID i token for senere tilbakekobling
    const token = jwt.sign(
      { 
        id: targetUser.id,
        epost: targetUser.epost,
        rolle: targetUser.rolle,
        bedriftId: targetUser.bedriftId,
        originalUserId: req.bruker!.id,
        isImpersonating: true
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    auditLog(
      req.bruker!.id,
      'START_IMPERSONATION',
      'Auth',
      {
        targetUserId: targetUser.id,
        targetUserEpost: targetUser.epost
      }
    );

    res.json({
      token,
      bruker: {
        id: targetUser.id,
        navn: `${targetUser.fornavn} ${targetUser.etternavn}`,
        epost: targetUser.epost,
        rolle: targetUser.rolle,
        tilganger: targetUser.tilganger,
        bedrift: targetUser.bedrift,
        bedriftId: targetUser.bedriftId
      },
      isImpersonating: true
    });
  })
);

// Stopp impersonering
router.post("/stop-impersonate", 
  verifyToken, 
  validate(stoppImpersoneringSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.bruker?.originalUserId) {
      throw ApiError.validation('Ikke i impersoneringsmodus');
    }

    logger.info('Stopper impersonering', {
      impersonatedUserId: req.bruker!.id,
      originalUserId: req.bruker.originalUserId
    });

    // Hent den opprinnelige admin brukeren
    const originalAdmin = await prisma.ansatt.findUnique({
      where: { id: req.bruker.originalUserId },
      include: { bedrift: true }
    });

    if (!originalAdmin) {
      throw ApiError.notFound('Original bruker', req.bruker.originalUserId);
    }

    // Lag ny token for admin brukeren (uten impersonering)
    const newToken = jwt.sign(
      { 
        id: originalAdmin.id,
        epost: originalAdmin.epost,
        rolle: originalAdmin.rolle,
        bedriftId: originalAdmin.bedriftId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    auditLog(
      originalAdmin.id,
      'STOP_IMPERSONATION',
      'Auth',
      {
        impersonatedUserId: req.bruker!.id
      }
    );

    res.json({
      token: newToken,
      bruker: {
        id: originalAdmin.id,
        navn: `${originalAdmin.fornavn} ${originalAdmin.etternavn}`,
        epost: originalAdmin.epost,
        rolle: originalAdmin.rolle,
        tilganger: originalAdmin.tilganger,
        bedrift: originalAdmin.bedrift,
        bedriftId: originalAdmin.bedriftId
      },
      isImpersonating: false
    });
  })
);

export default router; 
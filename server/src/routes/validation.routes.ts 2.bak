import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { verifyToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

const router = Router();

/**
 * @route GET /api/validation
 * @desc Get validation endpoints info
 * @access Private
 */
router.get('/', verifyToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Validation API',
    endpoints: [
      'GET /email - Validate email uniqueness',
      'GET /personnummer - Validate personnummer uniqueness', 
      'GET /organisasjonsnummer - Validate organisasjonsnummer uniqueness',
      'GET /kontrakt-duplikat - Check for duplicate contracts'
    ]
  });
});

// Schema for validering requests
const emailValidationSchema = z.object({
  query: z.object({
    email: z.string().email('Ugyldig e-postadresse'),
    excludeId: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

const personnummerValidationSchema = z.object({
  query: z.object({
    personnummer: z.string().regex(/^\d{11}$/, 'Personnummer må være 11 siffer'),
    excludeId: z.string().regex(/^\d+$/).transform(Number).optional(),
    type: z.enum(['elev', 'ansatt']).optional().default('elev')
  })
});

const organisasjonsnummerValidationSchema = z.object({
  query: z.object({
    organisasjonsnummer: z.string().regex(/^\d{9}$/, 'Organisasjonsnummer må være 9 siffer'),
    excludeId: z.string().regex(/^\d+$/).transform(Number).optional()
  })
});

/**
 * @route GET /api/validation/email
 * @desc Sjekk om e-postadresse er unik
 * @access Private
 */
router.get('/email', 
  verifyToken, 
  validate(emailValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, excludeId } = req.query as any;

    logger.info('Validerer e-post unikhet', { 
      email, 
      excludeId,
      requestId: (req as any).requestId 
    });

    // Sjekk i ansatt-tabellen
    const ansattExists = await prisma.ansatt.findFirst({
      where: {
        epost: email,
        ...(excludeId && { NOT: { id: excludeId } })
      },
      select: { id: true }
    });

    // Sjekk i elev-tabellen
    const elevExists = await prisma.elev.findFirst({
      where: {
        epost: email,
        ...(excludeId && { NOT: { id: excludeId } })
      },
      select: { id: true }
    });

    const isUnique = !ansattExists && !elevExists;

    res.json({
      success: true,
      data: {
        isUnique,
        email,
        message: isUnique ? 'E-postadresse er tilgjengelig' : 'E-postadresse er allerede i bruk'
      }
    });
  })
);

/**
 * @route GET /api/validation/personnummer
 * @desc Sjekk om personnummer er unikt
 * @access Private
 */
router.get('/personnummer',
  verifyToken,
  validate(personnummerValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { personnummer, excludeId, type } = req.query as any;

    logger.info('Validerer personnummer unikhet', { 
      personnummer: `${personnummer.substring(0, 6)}*****`, // Maskert for sikkerhet
      excludeId,
      type,
      requestId: (req as any).requestId 
    });

    let exists = false;

    if (type === 'elev') {
      const elevExists = await prisma.elev.findFirst({
        where: {
          personnummer,
          ...(excludeId && { NOT: { id: excludeId } })
        },
        select: { id: true }
      });
      exists = !!elevExists;
    } else if (type === 'ansatt') {
      // Hvis implementert personnummer for ansatte i fremtiden
      exists = false;
    } else {
      // Sjekk begge tabeller hvis type ikke er spesifisert
      const elevExists = await prisma.elev.findFirst({
        where: {
          personnummer,
          ...(excludeId && { NOT: { id: excludeId } })
        },
        select: { id: true }
      });
      exists = !!elevExists;
    }

    const isUnique = !exists;

    res.json({
      success: true,
      data: {
        isUnique,
        personnummer: `${personnummer.substring(0, 6)}*****`, // Maskert response
        message: isUnique ? 'Personnummer er tilgjengelig' : 'Personnummer er allerede registrert'
      }
    });
  })
);

/**
 * @route GET /api/validation/organisasjonsnummer
 * @desc Sjekk om organisasjonsnummer er unikt
 * @access Private
 */
router.get('/organisasjonsnummer',
  verifyToken,
  validate(organisasjonsnummerValidationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { organisasjonsnummer, excludeId } = req.query as any;

    logger.info('Validerer organisasjonsnummer unikhet', { 
      organisasjonsnummer, 
      excludeId,
      requestId: (req as any).requestId 
    });

    const bedriftExists = await prisma.bedrift.findFirst({
      where: {
        organisasjonsnummer: organisasjonsnummer,
        ...(excludeId && { NOT: { id: excludeId } })
      },
      select: { id: true }
    });

    const isUnique = !bedriftExists;

    res.json({
      success: true,
      data: {
        isUnique,
        organisasjonsnummer,
        message: isUnique ? 'Organisasjonsnummer er tilgjengelig' : 'Organisasjonsnummer er allerede registrert'
      }
    });
  })
);

/**
 * @route GET /api/validation/kontrakt-duplikat
 * @desc Sjekk for duplikat kontrakter basert på elev
 * @access Private
 */
router.get('/kontrakt-duplikat',
  verifyToken,
  validate(z.object({
    query: z.object({
      elevPersonnummer: z.string().regex(/^\d{11}$/, 'Personnummer må være 11 siffer'),
      bedriftId: z.string().regex(/^\d+$/).transform(Number),
      excludeId: z.string().regex(/^\d+$/).transform(Number).optional()
    })
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { elevPersonnummer, bedriftId, excludeId } = req.query as any;

    logger.info('Sjekker for duplikat kontrakter', { 
      elevPersonnummer: `${elevPersonnummer.substring(0, 6)}*****`,
      bedriftId,
      excludeId,
      requestId: (req as any).requestId 
    });

    // Sjekk for eksisterende aktive kontrakter for denne eleven i denne bedriften
    const eksisterendeKontrakt = await prisma.kontrakt.findFirst({
      where: {
        elevPersonnummer,
        bedriftId,
        status: {
          in: ['UTKAST', 'GODKJENT', 'SIGNERT', 'AKTIV']
        },
        ...(excludeId && { NOT: { id: excludeId } })
      },
      select: { 
        id: true, 
        status: true, 
        elevFornavn: true, 
        elevEtternavn: true,
        opprettet: true
      }
    });

    const hasDuplicate = !!eksisterendeKontrakt;

    res.json({
      success: true,
      data: {
        hasDuplicate,
        existingContract: eksisterendeKontrakt ? {
          id: eksisterendeKontrakt.id,
          status: eksisterendeKontrakt.status,
          elevNavn: `${eksisterendeKontrakt.elevFornavn} ${eksisterendeKontrakt.elevEtternavn}`,
          opprettet: eksisterendeKontrakt.opprettet
        } : null,
        message: hasDuplicate 
          ? 'Det finnes allerede en aktiv kontrakt for denne eleven'
          : 'Ingen duplikat kontrakter funnet'
      }
    });
  })
);

export { router as validationRoutes }; 
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, AuthRequest, sjekkRolle } from '../middleware/auth';
import logger, { auditLog } from '../utils/logger';
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import {
  createElevSchema,
  updateElevSchema,
  deleteElevSchema,
  searchElevSchema,
  getElevByIdSchema,
  getEleverByBedriftSchema
} from '../validation/elev.validation';

const router = Router();
const prisma = new PrismaClient();

// Søk etter elever
router.get("/sok", 
  verifyToken, 
  validate(searchElevSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { sokeord } = req.query as { sokeord: string };
    
    logger.info('Søker etter elever', {
      sokeord,
      userId: req.bruker!.id,
      bedriftId: req.bruker!.bedriftId
    });

    const elever = await prisma.elev.findMany({
      where: {
        bedriftId: req.bruker!.bedriftId!,
        OR: [
          { fornavn: { contains: sokeord, mode: 'insensitive' } },
          { etternavn: { contains: sokeord, mode: 'insensitive' } },
          { personnummer: { contains: sokeord } },
          { epost: { contains: sokeord, mode: 'insensitive' } }
        ]
      },
      include: {
        kontrakter: {
          select: {
            id: true,
            status: true,
            opprettet: true
          }
        }
      }
    });
    
    res.json(elever);
  })
);

// Hent alle elever for bedriften
router.get("/", verifyToken, asyncHandler(async (req: AuthRequest, res: Response) => {
  logger.info('Henter alle elever for bedrift', {
    userId: req.bruker!.id,
    bedriftId: req.bruker!.bedriftId
  });

  const elever = await prisma.elev.findMany({
    where: { bedriftId: req.bruker!.bedriftId! },
    include: {
      kontrakter: {
        select: {
          id: true,
          status: true,
          opprettet: true
        }
      }
    }
  });
  
  res.json(elever);
}));

// Hent elever for spesifikk bedrift (for admin-brukere)
router.get("/bedrift/:bedriftId", 
  verifyToken, 
  validate(getEleverByBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.bedriftId as unknown as number; // Validert av schema
    
    // Sjekk om brukeren har tilgang til denne bedriften
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til denne bedriften');
    }
    
    logger.info('Henter elever for bedrift', {
      bedriftId,
      userId: req.bruker!.id
    });
    
    const elever = await prisma.elev.findMany({
      where: { bedriftId },
      include: {
        kontrakter: {
          select: {
            id: true,
            status: true,
            opprettet: true
          }
        }
      }
    });
    
    res.json(elever);
  })
);

// Hent spesifikk elev
router.get("/:id", 
  verifyToken, 
  validate(getElevByIdSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.params.id as unknown as number; // Validert av schema

    const elev = await prisma.elev.findFirst({
      where: {
        id: elevId,
        bedriftId: req.bruker!.bedriftId!
      },
      include: {
        kontrakter: {
          select: {
            id: true,
            status: true,
            opprettet: true
          }
        }
      }
    });

    if (!elev) {
      throw new NotFoundError('Elev', elevId);
    }

    res.json(elev);
  })
);

// Opprett ny elev
router.post("/", 
  verifyToken, 
  validate(createElevSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      fornavn,
      etternavn,
      personnummer,
      epost,
      telefon,
      gate,
      postnummer,
      poststed,
      klassekode,
      bedriftId: requestBedriftId
    } = req.body;

    // Bestem hvilken bedriftId som skal brukes
    let bedriftId: number;
    if (req.bruker!.rolle === 'ADMIN' && requestBedriftId) {
      bedriftId = requestBedriftId;
    } else {
      bedriftId = req.bruker!.bedriftId!;
    }

    if (!bedriftId) {
      throw new ValidationError('BedriftId er påkrevd');
    }

    logger.info('Oppretter ny elev', {
      personnummer,
      bedriftId,
      userId: req.bruker!.id
    });

    // Sjekk om elev med samme personnummer allerede eksisterer
    const eksisterendeElev = await prisma.elev.findFirst({
      where: {
        personnummer,
        bedriftId
      }
    });

    if (eksisterendeElev) {
      throw new ConflictError('Elev med dette personnummeret eksisterer allerede');
    }

    const elev = await prisma.elev.create({
      data: {
        fornavn,
        etternavn,
        personnummer,
        epost,
        telefon,
        gate,
        postnummer,
        poststed,
        klassekode,
        bedriftId
      }
    });

    auditLog(
      req.bruker!.id,
      'CREATE_ELEV',
      'Elev',
      {
        elevId: elev.id,
        personnummer: elev.personnummer,
        bedriftId
      }
    );

    logger.info('Elev opprettet vellykket', {
      elevId: elev.id,
      bedriftId
    });

    res.status(201).json(elev);
  })
);

// Oppdater elev
router.put("/:id", 
  verifyToken, 
  validate(updateElevSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.params.id as unknown as number; // Validert av schema
    const {
      fornavn,
      etternavn,
      epost,
      telefon,
      gate,
      postnummer,
      poststed,
      klassekode
    } = req.body;

    // Sjekk at eleven tilhører brukerens bedrift
    const eksisterendeElev = await prisma.elev.findFirst({
      where: {
        id: elevId,
        bedriftId: req.bruker!.bedriftId!
      }
    });

    if (!eksisterendeElev) {
      throw new NotFoundError('Elev', elevId);
    }

    logger.info('Oppdaterer elev', {
      elevId,
      userId: req.bruker!.id
    });

    const elev = await prisma.elev.update({
      where: { id: elevId },
      data: {
        fornavn,
        etternavn,
        epost,
        telefon,
        gate,
        postnummer,
        poststed,
        klassekode,
        oppdatert: new Date()
      }
    });

    auditLog(
      req.bruker!.id,
      'UPDATE_ELEV',
      'Elev',
      {
        elevId: elev.id,
        endringer: {
          fra: eksisterendeElev,
          til: elev
        }
      }
    );

    res.json(elev);
  })
);

// Slett elev
router.delete("/:id", 
  verifyToken, 
  validate(deleteElevSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.params.id as unknown as number; // Validert av schema

    // Sjekk at eleven tilhører brukerens bedrift
    const eksisterendeElev = await prisma.elev.findFirst({
      where: {
        id: elevId,
        bedriftId: req.bruker!.bedriftId!
      }
    });

    if (!eksisterendeElev) {
      throw new NotFoundError('Elev', elevId);
    }

    // Sjekk om eleven har aktive kontrakter
    const aktiveKontrakter = await prisma.kontrakt.count({
      where: {
        elevId,
        status: { in: ['AKTIV', 'UTKAST'] }
      }
    });

    if (aktiveKontrakter > 0) {
      throw new ConflictError('Kan ikke slette elev med aktive kontrakter');
    }

    logger.info('Sletter elev', {
      elevId,
      userId: req.bruker!.id
    });

    await prisma.elev.delete({
      where: { id: elevId }
    });

    auditLog(
      req.bruker!.id,
      'DELETE_ELEV',
      'Elev',
      {
        elevId,
        personnummer: eksisterendeElev.personnummer
      }
    );

    res.json({ message: "Elev slettet" });
  })
);

export default router; 
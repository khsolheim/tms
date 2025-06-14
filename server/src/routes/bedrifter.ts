import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";
import logger, { auditLog } from "../utils/logger";
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from "../utils/errors";
import { asyncHandler } from "../middleware/errorHandler";
import { validate } from "../middleware/validation";
import {
  createBedriftSchema,
  updateBedriftSchema,
  setHovedbrukerSchema,
  addKlasserSchema,
  createAnsattSchema,
  createKjoretoySchema,
  updateKjoretoySchema,
  deleteByIdSchema,
  deleteKjoretoySchema,
  getBedriftByIdSchema,
  getBedriftByNameSchema,
  getAnsatteByBedriftSchema,
  getKjoretoyByBedriftSchema,
  addKlasserToBedriftSchema,
  setHovedbrukerForBedriftSchema,
  updateKjoretoyForBedriftSchema
} from "../validation/bedrift.validation";

const router = Router();
const prisma = new PrismaClient();

// Hent alle bedrifter (kun for admin)
router.get("/", verifyToken, sjekkRolle(['ADMIN']), asyncHandler(async (_req: Request, res: Response) => {
  logger.info('Henter alle bedrifter');
  
  const bedrifter = await prisma.bedrift.findMany({
    include: {
      ansatte: true,
      hovedbruker: true,
      klasser: true,
      kjoretoy: true
    }
  });
  
  res.json(bedrifter);
}));

// Hent spesifikk bedrift basert på navn (slug)
router.get("/by-name/:navn", 
  verifyToken, 
  validate(getBedriftByNameSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
  const bedriftNavn = decodeURIComponent(req.params.navn);
  
  const bedrift = await prisma.bedrift.findFirst({
    where: {
      navn: {
        equals: bedriftNavn,
        mode: 'insensitive'
      }
    },
    include: {
      ansatte: {
        select: {
          id: true,
          fornavn: true,
          etternavn: true,
          epost: true,
          rolle: true,
          telefon: true
        }
      },
      hovedbruker: {
        select: {
          id: true,
          fornavn: true,
          etternavn: true,
          epost: true
        }
      },
      klasser: true,
      kjoretoy: true
    }
  });

  if (!bedrift) {
    throw new NotFoundError('Bedrift', bedriftNavn);
  }

  // Sjekk tilgang
  if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedrift.id) {
    throw new ForbiddenError('Ikke tilgang til denne bedriften');
  }

  res.json(bedrift);
}));

// Hent spesifikk bedrift
router.get("/:id", 
  verifyToken, 
  validate(getBedriftByIdSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
  const bedriftId = Number(req.params.id);
  if (!bedriftId) {
    throw new ValidationError('Ugyldig bedrift-id');
  }

  const bedrift = await prisma.bedrift.findUnique({
    where: { id: bedriftId },
    include: {
      ansatte: {
        select: {
          id: true,
          fornavn: true,
          etternavn: true,
          epost: true,
          rolle: true,
          telefon: true
        }
      },
      hovedbruker: {
        select: {
          id: true,
          fornavn: true,
          etternavn: true,
          epost: true
        }
      },
      klasser: true,
      kjoretoy: true
    }
  });

  if (!bedrift) {
    throw new NotFoundError('Bedrift', bedriftId);
  }

  // Sjekk tilgang
  if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedrift.id) {
    throw new ForbiddenError('Ikke tilgang til denne bedriften');
  }

  res.json(bedrift);
}));

// Opprett ny bedrift (kun for admin)
router.post("/", 
  verifyToken, 
  sjekkRolle(['ADMIN']), 
  validate(createBedriftSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      navn, organisasjonsnummer, adresse, postnummer, poststed, telefon, epost,
      stiftelsesdato, organisasjonsform, organisasjonsformKode, 
      næringskode, næringskodeKode, dagligLeder, styreleder, 
      signaturrett, brregMetadata 
    } = req.body;

    logger.info('Oppretter ny bedrift', {
      navn,
      organisasjonsnummer,
      userId: (req as AuthRequest).bruker!.id
    });

    const bedrift = await prisma.bedrift.create({
      data: {
        navn,
        organisasjonsnummer: organisasjonsnummer || "",
        adresse,
        postnummer,
        poststed,
        telefon,
        epost,
        // Utvidet informasjon fra Brønnøysundregisteret
        stiftelsesdato,
        organisasjonsform,
        organisasjonsformKode,
        næringskode,
        næringskodeKode,
        dagligLeder,
        styreleder,
        signaturrett: signaturrett || [],
        brregMetadata: brregMetadata || null
      },
      include: {
        ansatte: true,
        hovedbruker: true,
        klasser: true,
        kjoretoy: true
      }
    });

    auditLog(
      (req as AuthRequest).bruker!.id,
      'CREATE_BEDRIFT',
      'Bedrift',
      {
        bedriftId: bedrift.id,
        navn: bedrift.navn,
        organisasjonsnummer: bedrift.organisasjonsnummer
      }
    );

    logger.info(`Bedrift opprettet vellykket`, {
      bedriftId: bedrift.id,
      navn: bedrift.navn
    });

    res.status(201).json(bedrift);
  })
);

// Opprett ansatt for bedrift
router.post("/:id/ansatte", 
  verifyToken,
  validate(createAnsattSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { fornavn, etternavn, epost, passord, rolle } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å opprette ansatt for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    // Sjekk om e-post allerede er i bruk
    const eksisterendeAnsatt = await prisma.ansatt.findUnique({
      where: { epost }
    });

    if (eksisterendeAnsatt) {
      throw new ConflictError('En ansatt med denne e-postadressen eksisterer allerede');
    }

    const saltRounds = 10;
    const passordHash = await bcrypt.hash(passord, saltRounds);

    const ansatt = await prisma.ansatt.create({
      data: {
        fornavn,
        etternavn,
        epost,
        passordHash,
        rolle: rolle || 'TRAFIKKLARER',
        bedriftId
      }
    });

    auditLog(
      req.bruker!.id,
      'CREATE_ANSATT',
      'Ansatt',
      {
        ansattId: ansatt.id,
        bedriftId,
        epost: ansatt.epost,
        rolle: ansatt.rolle
      }
    );

    logger.info('Ansatt opprettet', {
      ansattId: ansatt.id,
      bedriftId,
      rolle: ansatt.rolle
    });

    res.status(201).json({
      id: ansatt.id,
      navn: `${ansatt.fornavn} ${ansatt.etternavn}`,
      fornavn: ansatt.fornavn,
      etternavn: ansatt.etternavn,
      epost: ansatt.epost,
      rolle: ansatt.rolle,
      bedriftId: ansatt.bedriftId
    });
  })
);

// Oppdater bedrift
router.put("/:id", 
  verifyToken,
  validate(updateBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { 
      navn, organisasjonsnummer, adresse, postnummer, poststed, telefon, epost,
      stiftelsesdato, organisasjonsform, organisasjonsformKode,
      næringskode, næringskodeKode, dagligLeder, styreleder,
      signaturrett, brregMetadata
    } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å oppdatere denne bedriften');
    }

    // Hent eksisterende data for audit log
    const eksisterendeBedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!eksisterendeBedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    const bedrift = await prisma.bedrift.update({
      where: { id: bedriftId },
      data: {
        navn,
        organisasjonsnummer,
        adresse,
        postnummer,
        poststed,
        telefon,
        epost,
        stiftelsesdato,
        organisasjonsform,
        organisasjonsformKode,
        næringskode,
        næringskodeKode,
        dagligLeder,
        styreleder,
        signaturrett: signaturrett || [],
        brregMetadata: brregMetadata || null
      },
      include: {
        ansatte: true,
        hovedbruker: true,
        klasser: true,
        kjoretoy: true
      }
    });

    auditLog(
      req.bruker!.id,
      'UPDATE_BEDRIFT',
      'Bedrift',
      {
        bedriftId: bedrift.id,
        endringer: {
          fra: eksisterendeBedrift,
          til: bedrift
        }
      }
    );

    res.json(bedrift);
  })
);

// Sett hovedbruker for bedrift
router.put("/:id/hovedbruker", 
  verifyToken, 
  validate(setHovedbrukerForBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { hovedbrukerId } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å endre hovedbruker');
    }

    // Sjekk om bedrift eksisterer
    const eksisterendeBedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!eksisterendeBedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    // Sjekk om hovedbruker eksisterer og tilhører bedriften
    const hovedbruker = await prisma.ansatt.findFirst({
      where: { 
        id: hovedbrukerId,
        bedriftId: bedriftId
      }
    });

    if (!hovedbruker) {
      throw new ValidationError('Hovedbruker må tilhøre samme bedrift');
    }

    const bedrift = await prisma.bedrift.update({
      where: { id: bedriftId },
      data: { hovedbrukerId },
      include: { hovedbruker: true }
    });

    auditLog(
      req.bruker!.id,
      'SET_HOVEDBRUKER',
      'Bedrift',
      {
        bedriftId,
        hovedbrukerId
      }
    );
    
    res.json(bedrift);
  })
);

// Legg til klasser for bedrift
router.post("/:id/klasser", 
  verifyToken, 
  validate(addKlasserToBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { klasser } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å endre klasser for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    // Slett eksisterende klasser for bedriften
    await prisma.bedriftsKlasse.deleteMany({ where: { bedriftId } });
    
    // Legg til nye
    await prisma.bedriftsKlasse.createMany({
      data: klasser.map((klassekode: string) => ({ bedriftId, klassekode })),
    });

    auditLog(
      req.bruker!.id,
      'UPDATE_KLASSER',
      'Bedrift',
      {
        bedriftId,
        klasser
      }
    );
    
    res.json({ success: true, klasser });
  })
);

// Hent ansatte for bedrift
router.get("/:id/ansatte", 
  verifyToken, 
  validate(getAnsatteByBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til ansatte for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    const ansatte = await prisma.ansatt.findMany({
      where: { bedriftId },
      select: {
        id: true,
        fornavn: true,
        etternavn: true,
        epost: true,
        rolle: true,
        telefon: true
      }
    });

    res.json(ansatte);
  })
);

// Hent kjøretøy for bedrift
router.get("/:id/kjoretoy", 
  verifyToken, 
  validate(getKjoretoyByBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til denne bedriftens kjøretøy');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    const kjoretoy = await prisma.kjoretoy.findMany({
      where: { bedriftId },
      orderBy: { opprettet: 'desc' }
    });
    
    res.json(kjoretoy);
  })
);

// Opprett kjøretøy for bedrift
router.post("/:id/kjoretoy", 
  verifyToken,
  validate(createKjoretoySchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { registreringsnummer, merke, modell, aarsmodell, type, status, forerkortklass } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å opprette kjøretøy for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift', bedriftId);
    }

    try {
      const kjoretoy = await prisma.kjoretoy.create({
        data: {
          registreringsnummer, // Allerede uppercase fra validation
          merke,
          modell,
          aarsmodell,
          type,
          status,
          forerkortklass,
          bedriftId
        }
      });

      auditLog(
        req.bruker!.id,
        'CREATE_KJORETOY',
        'Kjoretoy',
        {
          kjoretoyId: kjoretoy.id,
          bedriftId,
          registreringsnummer: kjoretoy.registreringsnummer
        }
      );

      logger.info('Kjøretøy opprettet', {
        kjoretoyId: kjoretoy.id,
        bedriftId,
        registreringsnummer: kjoretoy.registreringsnummer
      });

      res.status(201).json(kjoretoy);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictError('Registreringsnummer finnes allerede');
      }
      throw e;
    }
  })
);

// Oppdater kjøretøy
router.put("/:bedriftId/kjoretoy/:id", 
  verifyToken, 
  validate(updateKjoretoyForBedriftSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = Number(req.params.bedriftId);
    const kjoretoyId = Number(req.params.id);
    const { registreringsnummer, merke, modell, aarsmodell, type, status, forerkortklass } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å oppdatere kjøretøy for denne bedriften');
    }

    // Sjekk om kjøretøy eksisterer
    const eksisterendeKjoretoy = await prisma.kjoretoy.findFirst({
      where: { id: kjoretoyId, bedriftId }
    });

    if (!eksisterendeKjoretoy) {
      throw new NotFoundError('Kjøretøy', kjoretoyId);
    }

    try {
      const kjoretoy = await prisma.kjoretoy.update({
        where: { id: kjoretoyId, bedriftId },
        data: {
          registreringsnummer,
          merke,
          modell,
          aarsmodell: Number(aarsmodell),
          type,
          status,
          forerkortklass
        }
      });

      auditLog(
        req.bruker!.id,
        'UPDATE_KJORETOY',
        'Kjoretoy',
        {
          kjoretoyId,
          bedriftId,
          registreringsnummer: kjoretoy.registreringsnummer
        }
      );

      logger.info('Kjøretøy oppdatert', {
        kjoretoyId,
        bedriftId,
        registreringsnummer: kjoretoy.registreringsnummer
      });

      res.json(kjoretoy);
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictError('Registreringsnummer finnes allerede');
      }
      throw e;
    }
  })
);

// Slett kjøretøy
router.delete("/:bedriftId/kjoretoy/:id", 
  verifyToken, 
  validate(deleteKjoretoySchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = Number(req.params.bedriftId);
    const kjoretoyId = Number(req.params.id);

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw new ForbiddenError('Ikke tilgang til å slette kjøretøy for denne bedriften');
    }

    // Sjekk om kjøretøy eksisterer
    const eksisterendeKjoretoy = await prisma.kjoretoy.findFirst({
      where: { id: kjoretoyId, bedriftId }
    });

    if (!eksisterendeKjoretoy) {
      throw new NotFoundError('Kjøretøy', kjoretoyId);
    }

    await prisma.kjoretoy.delete({
      where: { id: kjoretoyId, bedriftId }
    });

    auditLog(
      req.bruker!.id,
      'DELETE_KJORETOY',
      'Kjoretoy',
      {
        kjoretoyId,
        bedriftId,
        registreringsnummer: eksisterendeKjoretoy.registreringsnummer
      }
    );

    logger.info('Kjøretøy slettet', {
      kjoretoyId,
      bedriftId,
      registreringsnummer: eksisterendeKjoretoy.registreringsnummer
    });

    res.status(204).send();
  })
);

// Slett bedrift
router.delete("/:id", verifyToken, sjekkRolle(['ADMIN']), asyncHandler(async (req: AuthRequest, res: Response) => {
  const bedriftId = parseInt(req.params.id);
  
  if (!bedriftId) {
    throw new ValidationError('Ugyldig bedrift-id');
  }

  logger.info(`Starter sletting av bedrift ${bedriftId}`, {
    userId: req.bruker!.id,
    bedriftId
  });

  // Hent bedrift info før sletting for audit log
  const bedrift = await prisma.bedrift.findUnique({
    where: { id: bedriftId },
    select: { navn: true, organisasjonsnummer: true }
  });

  if (!bedrift) {
    throw new NotFoundError('Bedrift', bedriftId);
  }

  // Slett alle relaterte poster først
  await prisma.$transaction(async (tx) => {
    logger.debug(`Starter transaksjon for sletting av bedrift ${bedriftId}`);
    
    // Først fjern hovedbruker-referansen
    logger.debug('Fjerner hovedbruker-referanse');
    await tx.bedrift.update({
      where: { id: bedriftId },
      data: { hovedbrukerId: null }
    });

    // Slett elever
    logger.debug('Sletter elever');
    const elevCount = await tx.elev.deleteMany({
      where: { bedriftId }
    });
    logger.debug(`Slettet ${elevCount.count} elever`);

    // Slett elevsøknader
    logger.debug('Sletter elevsøknader');
    const soknadCount = await tx.elevSoknad.deleteMany({
      where: { bedriftId }
    });
    logger.debug(`Slettet ${soknadCount.count} elevsøknader`);

    // Slett sikkerhetskontroller (punkter slettes automatisk med cascade)
    logger.debug('Sletter sikkerhetskontroller');
    const kontrollCount = await tx.sikkerhetskontroll.deleteMany({
      where: { bedriftId }
    });
    logger.debug(`Slettet ${kontrollCount.count} sikkerhetskontroller`);

    // Slett kjøretøy
    logger.debug('Sletter kjøretøy');
    const kjoretoyCount = await tx.kjoretoy.deleteMany({
      where: { bedriftId }
    });
    logger.debug(`Slettet ${kjoretoyCount.count} kjøretøy`);

    // Slett bedriftsklasser
    logger.debug('Sletter bedriftsklasser');
    const klasseCount = await tx.bedriftsKlasse.deleteMany({
      where: { bedriftId }
    });
    logger.debug(`Slettet ${klasseCount.count} bedriftsklasser`);

    // Slett kontrollmaler opprettet av ansatte i bedriften
    logger.debug('Sletter kontrollmaler opprettet av ansatte i bedriften');
    const kontrollMalCount = await tx.kontrollMal.deleteMany({
      where: {
        opprettetAv: {
          bedriftId: bedriftId
        }
      }
    });
    logger.debug(`Slettet ${kontrollMalCount.count} kontrollmaler`);

    // Slett ansatte
    logger.debug('Sletter ansatte');
    const ansattCount = await tx.ansatt.deleteMany({
      where: { bedriftId }
    });
    logger.debug(`Slettet ${ansattCount.count} ansatte`);

    // Til slutt, slett bedriften
    logger.debug('Sletter bedrift');
    await tx.bedrift.delete({
      where: { id: bedriftId }
    });
  });

  // Audit log for sletting
  auditLog(
    req.bruker!.id,
    'DELETE_BEDRIFT',
    'Bedrift',
    {
      bedriftId,
      navn: bedrift.navn,
      organisasjonsnummer: bedrift.organisasjonsnummer
    }
  );

  logger.info(`Bedrift ${bedriftId} slettet vellykket`, {
    userId: req.bruker!.id,
    bedriftNavn: bedrift.navn
  });

  res.status(204).send();
}));

export default router; 
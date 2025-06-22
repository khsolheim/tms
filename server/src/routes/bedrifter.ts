import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifyToken, sjekkRolle, AuthRequest } from "../middleware/auth";
import logger, { auditLog } from "../utils/logger";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../middleware/errorHandler";
import {
  validateOpprettBedrift,
  validateOppdaterBedrift,
  validateHentBedrift,
  validateSlettBedrift,
  validateSokBedrifter,
  validateHentBedriftByOrgNummer,
  createKjoretoySchema
} from "../validation/bedrift.validation";
import { validateRequest } from "../middleware/requestValidation";

const router = Router();
const prisma = new PrismaClient();

// Funksjon for å hente kjøretøydata fra Statens Vegvesen API
async function hentKjoretoyFraVegvesen(registreringsnummer: string) {
  const apiKey = 'e5286ee7-9e53-481f-ad4e-1fb88ac0ac0d';
  const baseUrl = 'https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata';
  
  try {
    const response = await fetch(`${baseUrl}?kjennemerke=${registreringsnummer}`, {
      method: 'GET',
      headers: {
        'SVV-Authorization': `Apikey ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('HTTP Status:', response.status, '(' + response.statusText + ')');

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Kjøretøy ikke funnet
      }
      throw new Error(`Vegvesen API feil: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformer Vegvesen-data til vårt format basert på riktig API-struktur
    if (data && data.kjoretoydataListe && data.kjoretoydataListe.length > 0) {
      const kjoretoyData = data.kjoretoydataListe[0];
      
      // Registreringsdata
      const registreringsstatus = kjoretoyData.registrering?.registreringsstatus?.kodeBeskrivelse || 'Ukjent';
      const kjennemerke = kjoretoyData.kjoretoyId?.kjennemerke || registreringsnummer;
      const understellsnummer = kjoretoyData.kjoretoyId?.understellsnummer || '';
      
      // Tekniske data
      const tekniskeData = kjoretoyData.godkjenning?.tekniskGodkjenning?.tekniskeData;
      const merke = tekniskeData?.generelt?.merke?.[0]?.merke || '';
      const modell = tekniskeData?.generelt?.handelsbetegnelse?.[0] || '';
      const kjoretoyklassifisering = kjoretoyData.godkjenning?.tekniskGodkjenning?.kjoretoyklassifisering?.beskrivelse || '';
      const antallSeter = tekniskeData?.persontall?.sitteplasserTotalt || 0;
      const farge = tekniskeData?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn || '';
      const euroKlasse = tekniskeData?.miljodata?.euroKlasse?.kodeNavn || '';
      const drivstoff = tekniskeData?.miljodata?.miljoOgdrivstoffGruppe?.[0]?.drivstoffKodeMiljodata?.kodeNavn || '';
      
      // Periodisk kjøretøykontroll
      const kontrollfrist = kjoretoyData.periodiskKjoretoyKontroll?.kontrollfrist || '';
      
      // Map kjøretøygruppe til våre typer
      const type = mapKjoretoyklassifiseringTilType(kjoretoyklassifisering);
      const forerkortklass = mapTypeToForerkortklasser(type);
      
      return {
        registreringsnummer: kjennemerke,
        merke: merke,
        modell: modell,
        aarsmodell: null, // Ikke tilgjengelig i API-responsen
        type: type,
        drivstoff: drivstoff,
        effekt: 0, // Ikke tilgjengelig i denne API-responsen
        vekt: 0, // Ikke tilgjengelig i denne API-responsen
        forerkortklass: forerkortklass.join(', '),
        euKontrollFrist: kontrollfrist,
        euKontrollSist: '', // Ikke tilgjengelig i API-responsen
        registrertForstGang: '', // Ikke tilgjengelig i API-responsen
        registreringsstatus: registreringsstatus,
        understellsnummer: understellsnummer,
        antallSeter: antallSeter,
        farge: farge,
        euroKlasse: euroKlasse
      };
    }
    
    return null;
  } catch (error: any) {
    logger.error('Feil ved kall til Vegvesen API', {
      registreringsnummer,
      error: error.message
    });
    throw error;
  }
}

// Hjelpefunksjoner for å mappe Vegvesen-data
function mapKjoretoyklassifiseringTilType(kjoretoyklassifisering?: string): string {
  if (!kjoretoyklassifisering) return 'Ukjent';
  
  const klassifisering = kjoretoyklassifisering.toLowerCase();
  
  if (klassifisering.includes('personbil')) return 'Personbil';
  if (klassifisering.includes('motorsykkel')) return 'Motorsykkel';
  if (klassifisering.includes('lastebil')) return 'Lastebil';
  if (klassifisering.includes('buss')) return 'Buss';
  if (klassifisering.includes('traktor')) return 'Traktor';
  if (klassifisering.includes('moped')) return 'Moped';
  if (klassifisering.includes('varebil')) return 'Varebil';
  
  return 'Annet';
}

function mapTypeToForerkortklasser(type: string): string[] {
  const mapping: Record<string, string[]> = {
    'Personbil': ['B'],
    'Varebil': ['B'],
    'Lastebil': ['C1', 'C'],
    'Buss': ['D1', 'D'],
    'Motorsykkel': ['A1', 'A2', 'A'],
    'Moped': ['AM'],
    'Traktor': ['T'],
    'Annet': ['B']
  };
  
  return mapping[type] || ['B'];
}

// Hent kjøretøyinformasjon fra Statens Vegvesen (må være før /:id ruter)
router.get("/vegvesen/kjoretoy/:registreringsnummer", 
  asyncHandler(async (req: Request, res: Response) => {
    const registreringsnummer = req.params.registreringsnummer.toUpperCase().trim();
    
    // Valider registreringsnummer format (2 bokstaver + 5 tall)
    const regexPattern = /^[A-Z]{2}\d{5}$/;
    if (!regexPattern.test(registreringsnummer)) {
      throw ApiError.badRequest('Ugyldig registreringsnummer format. Må være 2 bokstaver + 5 tall (f.eks. AB12345)');
    }

    logger.info('Henter kjøretøyinformasjon fra Statens Vegvesen', {
      registreringsnummer
    });

    try {
      // Kall Statens Vegvesen API
      const vegvesenData = await hentKjoretoyFraVegvesen(registreringsnummer);
      
      if (!vegvesenData) {
        return res.json({
          success: false,
          error: 'Kjøretøy ikke funnet i Statens Vegvesen sitt register'
        });
      }

      res.json({
        success: true,
        data: vegvesenData
      });
    } catch (error: any) {
      logger.error('Feil ved henting av kjøretøyinformasjon', {
        registreringsnummer,
        error: error.message
      });
      
      // Fall tilbake til mock-data hvis API-kall feiler
      const mockKjoretoyData = getMockKjoretoyData(registreringsnummer);
      if (mockKjoretoyData) {
        logger.warn('Bruker mock-data som fallback', { registreringsnummer });
        return res.json({
          success: true,
          data: mockKjoretoyData
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Kunne ikke hente kjøretøyinformasjon fra Statens Vegvesen',
        details: error.message
      });
    }
  })
);

// Hent alle bedrifter (kun for admin)
router.get("/", verifyToken, sjekkRolle(['ADMIN']), validateSokBedrifter, asyncHandler(async (_req: Request, res: Response) => {
  logger.info('Henter alle bedrifter');
  
  const bedrifter = await prisma.bedrift.findMany({
    where: {
      isDeleted: false
    },
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
  const bedriftNavn = decodeURIComponent(req.params.navn);
  
  const bedrift = await prisma.bedrift.findFirst({
    where: {
      navn: {
        equals: bedriftNavn,
        mode: 'insensitive'
      },
      isDeleted: false
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
    throw ApiError.notFound(`Bedrift med navn '${bedriftNavn}' ble ikke funnet`);
  }

  // Sjekk tilgang
  if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedrift.id) {
    throw ApiError.forbidden('Ikke tilgang til denne bedriften');
  }

  res.json(bedrift);
}));

// Hent spesifikk bedrift
router.get("/:id", 
  verifyToken, 
  validateHentBedrift,
  asyncHandler(async (req: AuthRequest, res: Response) => {
  const bedriftId = Number(req.params.id);
  if (!bedriftId) {
    throw ApiError.badRequest('Ugyldig bedrift-id');
  }

  const bedrift = await prisma.bedrift.findFirst({
    where: { 
      id: bedriftId,
      isDeleted: false
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
    throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
  }

  // Sjekk tilgang
  if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedrift.id) {
    throw ApiError.forbidden('Ikke tilgang til denne bedriften');
  }

  res.json(bedrift);
}));

// Opprett ny bedrift (kun for admin)
router.post("/", 
  verifyToken, 
  sjekkRolle(['ADMIN']), 
  validateOpprettBedrift,
  asyncHandler(async (req: Request, res: Response) => {
    const { 
      navn, organisasjonsnummer, adresse, postnummer, poststed, telefon, epost,
      stiftelsesdato, organisasjonsform, organisasjonsformKode, 
      naeringskode, naeringskodeKode, dagligLeder, styreleder, 
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
        naeringskode,
        naeringskodeKode,
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = parseInt(req.params.id, 10);

    if (isNaN(bedriftId)) {
      throw ApiError.badRequest('Ugyldig bedrift-id');
    }
    const { fornavn, etternavn, epost, passord, rolle } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å opprette ansatt for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
    }

    // Sjekk om e-post allerede er i bruk
    const eksisterendeAnsatt = await prisma.ansatt.findUnique({
      where: { epost }
    });

    if (eksisterendeAnsatt) {
      throw ApiError.conflict('En ansatt med denne e-postadressen eksisterer allerede');
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { 
      navn, organisasjonsnummer, adresse, postnummer, poststed, telefon, epost,
      stiftelsesdato, organisasjonsform, organisasjonsformKode,
      naeringskode, naeringskodeKode, dagligLeder, styreleder,
      signaturrett, brregMetadata
    } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å oppdatere denne bedriften');
    }

    // Hent eksisterende data for audit log
    const eksisterendeBedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!eksisterendeBedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
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
        naeringskode,
        naeringskodeKode,
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { hovedbrukerId } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å endre hovedbruker');
    }

    // Sjekk om bedrift eksisterer
    const eksisterendeBedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!eksisterendeBedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
    }

    // Sjekk om hovedbruker eksisterer og tilhører bedriften
    const hovedbruker = await prisma.ansatt.findFirst({
      where: { 
        id: hovedbrukerId,
        bedriftId: bedriftId
      }
    });

    if (!hovedbruker) {
      throw ApiError.validation('Hovedbruker må tilhøre samme bedrift');
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema
    const { klasser } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å endre klasser for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = req.params.id as unknown as number; // Validert av schema

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til ansatte for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
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

// Hent kjoretoy for bedrift
router.get("/:id/kjoretoy", 
  verifyToken, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = parseInt(req.params.id, 10);

    if (isNaN(bedriftId)) {
      throw ApiError.badRequest('Ugyldig bedrift-id');
    }

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til denne bedriftens kjoretoy');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
    }

    const kjoretoy = await prisma.kjoretoy.findMany({
      where: { bedriftId },
      orderBy: { opprettet: 'desc' }
    });
    
    res.json(kjoretoy);
  })
);

// Opprett kjoretoy for bedrift
router.post("/:id/kjoretoy", 
  verifyToken,
  validateRequest({ body: createKjoretoySchema.shape.body, params: createKjoretoySchema.shape.params }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = parseInt(req.params.id, 10);

    if (isNaN(bedriftId)) {
      throw ApiError.badRequest('Ugyldig bedrift-id');
    }
    const { registreringsnummer, merke, modell, aarsmodell, type, status, forerkortklass } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å opprette kjoretoy for denne bedriften');
    }

    // Sjekk om bedrift eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
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
          forerkortklass: forerkortklass || ['B'],
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
        throw ApiError.conflict('Registreringsnummer finnes allerede');
      }
      throw e;
    }
  })
);

// Oppdater kjoretoy
router.put("/:bedriftId/kjoretoy/:id", 
  verifyToken, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = Number(req.params.bedriftId);
    const kjoretoyId = Number(req.params.id);
    const { registreringsnummer, merke, modell, aarsmodell, type, status, forerkortklass } = req.body;

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å oppdatere kjoretoy for denne bedriften');
    }

    // Sjekk om kjoretoy eksisterer
    const eksisterendeKjoretoy = await prisma.kjoretoy.findFirst({
      where: { id: kjoretoyId, bedriftId }
    });

    if (!eksisterendeKjoretoy) {
      throw ApiError.notFound(`'Kjøretøy' med ID ${String(kjoretoyId)} ble ikke funnet`);
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
          forerkortklass: forerkortklass || ['B']
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
        throw ApiError.conflict('Registreringsnummer finnes allerede');
      }
      throw e;
    }
  })
);

// Slett kjoretoy
router.delete("/:bedriftId/kjoretoy/:id", 
  verifyToken, 
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const bedriftId = Number(req.params.bedriftId);
    const kjoretoyId = Number(req.params.id);

    // Sjekk tilgang
    if (req.bruker!.rolle !== 'ADMIN' && req.bruker!.bedriftId !== bedriftId) {
      throw ApiError.forbidden('Ikke tilgang til å slette kjoretoy for denne bedriften');
    }

    // Sjekk om kjoretoy eksisterer
    const eksisterendeKjoretoy = await prisma.kjoretoy.findFirst({
      where: { id: kjoretoyId, bedriftId }
    });

    if (!eksisterendeKjoretoy) {
      throw ApiError.notFound(`'Kjøretøy' med ID ${String(kjoretoyId)} ble ikke funnet`);
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
    throw ApiError.validation('Ugyldig bedrift-id');
  }

  logger.info(`Starter sletting av bedrift ${bedriftId}`, {
    userId: req.bruker!.id,
    bedriftId
  });

  // Hent bedrift info før sletting for audit log
  const bedrift = await prisma.bedrift.findFirst({
    where: { 
      id: bedriftId,
      isDeleted: false
    },
    select: { navn: true, organisasjonsnummer: true }
  });

  if (!bedrift) {
    throw ApiError.notFound(`'Bedrift' med ID ${String(bedriftId)} ble ikke funnet`);
  }

  // Soft delete bedriften
  await prisma.bedrift.update({
    where: { id: bedriftId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.bruker!.id
    }
  });

  logger.debug(`Bedrift ${bedriftId} markert som slettet (soft delete)`);

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





// Mock-funksjon for å simulere Statens Vegvesen API (fallback)
function getMockKjoretoyData(registreringsnummer: string) {
  // Simuler noen kjente registreringsnummer for testing
  const mockDatabase: Record<string, any> = {
    'AB12345': {
      registreringsnummer: 'AB12345',
      merke: 'Toyota',
      modell: 'Yaris',
      aarsmodell: 2022,
      type: 'Personbil',
      drivstofftype: 'Bensin',
      effekt: 85,
      co2Utslipp: 120,
      egenvekt: 1200,
      totalvekt: 1600,
      forerkortklass: 'B',
      registrertForstegangNorge: '2022-03-15',
      tekniskGodkjenning: '2022-03-10',
      sistEUKontroll: '2024-03-15',
      nesteEUKontroll: '2026-03-15'
    },
    'CD67890': {
      registreringsnummer: 'CD67890',
      merke: 'Volkswagen',
      modell: 'Golf',
      aarsmodell: 2021,
      type: 'Personbil',
      drivstofftype: 'Diesel',
      effekt: 110,
      co2Utslipp: 140,
      egenvekt: 1350,
      totalvekt: 1850,
      forerkortklass: 'B',
      registrertForstegangNorge: '2021-08-20',
      tekniskGodkjenning: '2021-08-15',
      sistEUKontroll: '2024-08-20',
      nesteEUKontroll: '2026-08-20'
    },
    'EF11111': {
      registreringsnummer: 'EF11111',
      merke: 'Mercedes-Benz',
      modell: 'Sprinter',
      aarsmodell: 2020,
      type: 'Varebil',
      drivstofftype: 'Diesel',
      effekt: 140,
      co2Utslipp: 180,
      egenvekt: 2200,
      totalvekt: 3500,
      forerkortklass: 'B, C1',
      registrertForstegangNorge: '2020-05-10',
      tekniskGodkjenning: '2020-05-05',
      sistEUKontroll: '2023-05-10',
      nesteEUKontroll: '2024-05-10'
    },
    'GH22222': {
      registreringsnummer: 'GH22222',
      merke: 'Volvo',
      modell: 'FH16',
      aarsmodell: 2019,
      type: 'Lastebil',
      drivstofftype: 'Diesel',
      effekt: 420,
      co2Utslipp: 280,
      egenvekt: 8500,
      totalvekt: 40000,
      forerkortklass: 'C, CE',
      registrertForstegangNorge: '2019-11-12',
      tekniskGodkjenning: '2019-11-08',
      sistEUKontroll: '2024-11-12',
      nesteEUKontroll: '2025-05-12'
    },
    'IJ33333': {
      registreringsnummer: 'IJ33333',
      merke: 'BMW',
      modell: 'R1250GS',
      aarsmodell: 2023,
      type: 'Motorsykkel',
      drivstofftype: 'Bensin',
      effekt: 100,
      co2Utslipp: 95,
      egenvekt: 250,
      totalvekt: 450,
      forerkortklass: 'A',
      registrertForstegangNorge: '2023-06-01',
      tekniskGodkjenning: '2023-05-28',
      sistEUKontroll: '2024-06-01',
      nesteEUKontroll: '2026-06-01'
    },
    'SV81555': {
      registreringsnummer: 'SV81555',
      merke: 'Tesla',
      modell: 'Model 3',
      aarsmodell: 2023,
      type: 'Personbil',
      drivstofftype: 'Elektrisk',
      effekt: 225,
      co2Utslipp: 0,
      egenvekt: 1650,
      totalvekt: 2100,
      forerkortklass: 'B',
      registrertForstegangNorge: '2023-09-15',
      tekniskGodkjenning: '2023-09-10',
      sistEUKontroll: '2024-09-15',
      nesteEUKontroll: '2026-09-15'
    }
  };

  return mockDatabase[registreringsnummer] || null;
}

export default router; 
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, AuthRequest } from '../middleware/auth';
import logger, { auditLog } from '../utils/logger';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Multer konfiguration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/media');
    
    // Opprett directory hvis det ikke eksisterer
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generer unikt filnavn med timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `media-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tillatte filtyper
  const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|ogg|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Kun bilder, videoer og lydfiler er tillatt'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB grense
  },
  fileFilter: fileFilter
});

// ============================================================================
// MIN DAG DASHBOARD - Personlig oversikt med glemme-kurve algoritme
// ============================================================================

// Hent "Min Dag" data med dagens repetisjon, siste achievement, progresjon og streak
router.get("/min-dag", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    logger.info('Henter Min Dag data', { userId: elevId });

    try {
      // 1. Beregn dagens repetisjon basert på glemme-kurve algoritme
      const dagensRepetisjon = await beregnDagensRepetisjon(elevId);

      // 2. Hent siste achievement
      const sisteAchievement = await prisma.sikkerhetskontrollElevAchievement.findFirst({
        where: { elevId },
        include: {
          achievement: {
            select: {
              navn: true,
              beskrivelse: true,
              ikonUrl: true
            }
          }
        },
        orderBy: { oppnaddDato: 'desc' }
      });

      // 3. Beregn total progresjon på tvers av alle klasser
      const totalProgresjon = await beregnTotalProgresjon(elevId);

      // 4. Beregn øvetid i dag
      const iDag = new Date();
      iDag.setHours(0, 0, 0, 0);
      const ovetidIDag = await prisma.sikkerhetskontrollElevProgresjon.aggregate({
        where: {
          elevId,
          sisteInteraksjonDato: {
            gte: iDag
          }
        },
        _sum: {
          totalTid: true
        }
      });

      // 5. Beregn streak (dager på rad med aktivitet)
      const streak = await beregnStreak(elevId);

      const minDagData = {
        dagensRepetisjon,
        sisteAchievement: sisteAchievement ? {
          navn: sisteAchievement.achievement.navn,
          oppnaddDato: sisteAchievement.oppnaddDato.toLocaleDateString('no-NO'),
          ikonUrl: sisteAchievement.achievement.ikonUrl
        } : null,
        totalProgresjon,
        ovetidIDag: Math.round((ovetidIDag._sum.totalTid || 0) / 60), // Konverter til minutter
        streak
      };

      res.json(minDagData);
    } catch (error) {
      logger.error('Feil ved henting av Min Dag data:', error);
      res.status(500).json({ error: 'Kunne ikke hente Min Dag data' });
    }
  })
);

// Hjelpefunksjon: Beregn dagens repetisjon basert på glemme-kurve
async function beregnDagensRepetisjon(elevId: number) {
  const enUkeSiden = new Date();
  enUkeSiden.setDate(enUkeSiden.getDate() - 7);

  // Finn kategorier som trenger repetisjon (mestret, men ikke øvd på en uke)
  const kategorierForRepetisjon = await prisma.sikkerhetskontrollElevProgresjon.findMany({
    where: {
      elevId,
      mestret: true,
      sisteInteraksjonDato: {
        lt: enUkeSiden
      }
    },
    include: {
      kategori: {
        select: {
          navn: true,
          _count: {
            select: { sporsmal: true }
          }
        }
      }
    },
    orderBy: {
      sisteInteraksjonDato: 'asc' // Eldste først
    },
    take: 1
  });

  if (kategorierForRepetisjon.length > 0) {
    const kategori = kategorierForRepetisjon[0];
    if (kategori.kategori) {
      return {
        kategori: kategori.kategori.navn,
        antallSporsmal: Math.min(5, kategori.kategori._count.sporsmal), // Maks 5 spørsmål
        sistOvd: kategori.sisteInteraksjonDato.toLocaleDateString('no-NO')
      };
    }
  }

  return null;
}

// Hjelpefunksjon: Beregn total progresjon på tvers av alle klasser
async function beregnTotalProgresjon(elevId: number): Promise<number> {
  const alleSporsmal = await prisma.sikkerhetskontrollSporsmal.count({
    where: { aktiv: true }
  });

  const mestredeSporšmal = await prisma.sikkerhetskontrollElevProgresjon.count({
    where: {
      elevId,
      status: 'MESTRET'
    }
  });

  return alleSporsmal > 0 ? (mestredeSporšmal / alleSporsmal) * 100 : 0;
}

// Hjelpefunksjon: Beregn streak (dager på rad med aktivitet)
async function beregnStreak(elevId: number): Promise<number> {
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(23, 59, 59, 999); // Slutt av dagen

  while (true) {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const aktivitetIDag = await prisma.sikkerhetskontrollElevProgresjon.findFirst({
      where: {
        elevId,
        sisteInteraksjonDato: {
          gte: startOfDay,
          lte: currentDate
        }
      }
    });

    if (aktivitetIDag) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
      currentDate.setHours(23, 59, 59, 999);
    } else {
      break;
    }

    // Sikkerhet: Ikke tell mer enn 365 dager
    if (streak >= 365) break;
  }

  return streak;
}

// ============================================================================
// KLASSER (Førerkortklasser: B, C, D, etc.)
// ============================================================================

// Hent alle aktive klasser
router.get("/klasser", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    logger.info('Henter sikkerhetskontroll-klasser', { userId: req.bruker!.id });

    const klasser = await prisma.sikkerhetskontrollKlasse.findMany({
      where: { aktiv: true },
      include: {
        kategorier: {
          where: { aktiv: true },
          orderBy: { rekkefolge: 'asc' },
          select: {
            id: true,
            navn: true,
            beskrivelse: true,
            ikonUrl: true,
            farge: true,
            _count: {
              select: { sporsmal: { where: { aktiv: true } } }
            }
          }
        }
      },
      orderBy: { rekkefolge: 'asc' }
    });

    res.json(klasser);
  })
);

// Hent spesifikk klasse med detaljer
router.get("/klasser/:id", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const klasseId = parseInt(req.params.id);
    
    const klasse = await prisma.sikkerhetskontrollKlasse.findFirst({
      where: { id: klasseId, aktiv: true },
      include: {
        kategorier: {
          where: { aktiv: true },
          include: {
            sporsmal: {
              where: { aktiv: true },
              select: {
                id: true,
                sporsmalTekst: true,
                vanskelighetsgrad: true,
                rekkefolge: true
              },
              orderBy: { rekkefolge: 'asc' }
            }
          },
          orderBy: { rekkefolge: 'asc' }
        }
      }
    });

    if (!klasse) {
      throw new NotFoundError('Klasse ikke funnet');
    }

    res.json(klasse);
  })
);

// ============================================================================
// KATEGORIER (Bremser, Lys, Motorrom, etc.)
// ============================================================================

// Hent kategorier for en klasse
router.get("/klasser/:klasseId/kategorier", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const klasseId = parseInt(req.params.klasseId);
    
    const kategorier = await prisma.sikkerhetskontrollKategori.findMany({
      where: { 
        klasseId: klasseId,
        aktiv: true 
      },
      include: {
        _count: {
          select: { sporsmal: { where: { aktiv: true } } }
        }
      },
      orderBy: { rekkefolge: 'asc' }
    });

    res.json(kategorier);
  })
);

// ============================================================================
// SPØRSMÅL OG SVAR
// ============================================================================

// Hent spørsmål for en kategori
router.get("/kategorier/:kategoriId/sporsmal", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const kategoriId = parseInt(req.params.kategoriId);
    const { medSvar = false } = req.query;
    
    const selectFields: any = {
      id: true,
      sporsmalTekst: true,
      vanskelighetsgrad: true,
      rekkefolge: true,
      media: {
        select: {
          id: true,
          mediaType: true,
          url: true,
          altTekst: true,
          tittel: true,
          rekkefolge: true
        },
        orderBy: { rekkefolge: 'asc' }
      }
    };

    // Hvis medSvar=true, inkluder svar (for lærere eller etter feil svar)
    if (medSvar === 'true') {
      selectFields.svarKort = true;
      selectFields.svarDetaljert = true;
      selectFields.hvorforderVikreligTekst = true;
    }

    const sporsmal = await prisma.sikkerhetskontrollSporsmal.findMany({
      where: { 
        kategoriId: kategoriId,
        aktiv: true 
      },
      select: selectFields,
      orderBy: { rekkefolge: 'asc' }
    });

    res.json(sporsmal);
  })
);

// Hent spesifikt spørsmål med komplett info
router.get("/sporsmal/:id", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const sporsmalId = parseInt(req.params.id);
    
    const sporsmal = await prisma.sikkerhetskontrollSporsmal.findFirst({
      where: { 
        id: sporsmalId,
        aktiv: true 
      },
      include: {
        media: {
          orderBy: { rekkefolge: 'asc' }
        },
        kategori: {
          select: {
            id: true,
            navn: true,
            klasse: {
              select: {
                id: true,
                navn: true
              }
            }
          }
        }
      }
    });

    if (!sporsmal) {
      throw new NotFoundError('Spørsmål ikke funnet');
    }

    res.json(sporsmal);
  })
);

// ============================================================================
// ELEV-PROGRESJON OG LÆRING
// ============================================================================

// Hent elevens progresjon for en klasse
router.get("/progresjon/klasse/:klasseId", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const klasseId = parseInt(req.params.klasseId);
    // TEMPORARY FIX: Use test Elev ID 1 instead of Ansatt ID
    const elevId = 1; // req.bruker!.id; // Antar at eleven er logget inn

    // Hent eller opprett elev-bil for visuell progresjon
    let elevBil = await prisma.sikkerhetskontrollBil.findUnique({
      where: { elevId: elevId }
    });

    if (!elevBil) {
      elevBil = await prisma.sikkerhetskontrollBil.create({
        data: { elevId: elevId }
      });
    }

    // Hent progresjon per kategori
    const kategorier = await prisma.sikkerhetskontrollKategori.findMany({
      where: { 
        klasseId: klasseId,
        aktiv: true 
      },
      include: {
        sporsmal: {
          where: { aktiv: true },
          include: {
            elevProgresjon: {
              where: { elevId: elevId }
            }
          }
        }
      },
      orderBy: { rekkefolge: 'asc' }
    });

    // Beregn progresjon per kategori
    const progresjonsData = kategorier.map(kategori => {
      const totaleSporšmal = kategori.sporsmal.length;
      const mestredeSporšmal = kategori.sporsmal.filter(s => 
        s.elevProgresjon.length > 0 && s.elevProgresjon[0].status === 'MESTRET'
      ).length;
      const seTteSporšmal = kategori.sporsmal.filter(s => 
        s.elevProgresjon.length > 0 && s.elevProgresjon[0].status !== 'IKKE_SETT'
      ).length;
      
      return {
        kategori: {
          id: kategori.id,
          navn: kategori.navn,
          beskrivelse: kategori.beskrivelse,
          ikonUrl: kategori.ikonUrl,
          farge: kategori.farge
        },
        totaleSporšmal,
        seTteSporšmal,
        mestredeSporšmal,
        progresjonsProsentSett: totaleSporšmal > 0 ? (seTteSporšmal / totaleSporšmal) * 100 : 0,
        progresjonsProsentMestret: totaleSporšmal > 0 ? (mestredeSporšmal / totaleSporšmal) * 100 : 0
      };
    });

    // Beregn total progresjon
    const totalSporšmal = progresjonsData.reduce((sum, k) => sum + k.totaleSporšmal, 0);
    const totalMestret = progresjonsData.reduce((sum, k) => sum + k.mestredeSporšmal, 0);
    const totalProgresjon = totalSporšmal > 0 ? (totalMestret / totalSporšmal) * 100 : 0;

    // Oppdater bil-progresjon
    if (totalProgresjon !== elevBil.totalProgresjon) {
      elevBil = await prisma.sikkerhetskontrollBil.update({
        where: { elevId: elevId },
        data: { totalProgresjon: totalProgresjon }
      });
    }

    res.json({
      elevBil,
      totalProgresjon,
      kategorier: progresjonsData
    });
  })
);

// Marker spørsmål som sett/øvd
router.post("/progresjon/sporsmal/:sporsmalId", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const sporsmalId = parseInt(req.params.sporsmalId);
    // TEMPORARY FIX: Use test Elev ID 1 instead of Ansatt ID
    const elevId = 1; // req.bruker!.id;
    const { status, vanskelighetsmarkering, personligNotat, riktigSvar } = req.body;

    // Valider status
    const validStatuses = ['IKKE_SETT', 'SETT', 'VANSKELIG', 'MESTRET'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Ugyldig status');
    }

    // Hent eksisterende progresjon eller opprett ny
    let progresjon = await prisma.sikkerhetskontrollElevProgresjon.findUnique({
      where: {
        unique_elev_sporsmal_progresjon: {
          elevId: elevId,
          sporsmalId: sporsmalId
        }
      }
    });

    const updateData: any = {
      status,
      sisteInteraksjonDato: new Date(),
      vanskelighetsmarkering,
      personligNotat
    };

    // Oppdater XP og teller for forsøk
    if (riktigSvar === true) {
      updateData.antallRiktigeForsok = progresjon ? progresjon.antallRiktigeForsok + 1 : 1;
      updateData.xpOpptjent = progresjon ? progresjon.xpOpptjent + 10 : 10;
    } else if (riktigSvar === false) {
      updateData.antallGaleForsok = progresjon ? progresjon.antallGaleForsok + 1 : 1;
    }

    if (progresjon) {
      progresjon = await prisma.sikkerhetskontrollElevProgresjon.update({
        where: { id: progresjon.id },
        data: updateData
      });
    } else {
      // Hent spørsmål for å få klasseId
      const sporsmal = await prisma.sikkerhetskontrollSporsmal.findUnique({
        where: { id: sporsmalId },
        include: { kategori: true }
      });

      progresjon = await prisma.sikkerhetskontrollElevProgresjon.create({
        data: {
          elevId,
          sporsmalId,
          klasseId: sporsmal!.kategori.klasseId,
          ...updateData
        }
      });
    }

    // Sjekk for achievements
    await sjekkAchievements(elevId);

    logger.info('Progresjon oppdatert', {
      elevId,
      sporsmalId,
      status,
      riktigSvar
    });

    res.json(progresjon);
  })
);

// ============================================================================
// ACHIEVEMENTS OG GAMIFICATION
// ============================================================================

// Hent elevens achievements
router.get("/achievements", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TEMPORARY FIX: Use test Elev ID 1 instead of Ansatt ID
    const elevId = 1; // req.bruker!.id;

    const elevAchievements = await prisma.sikkerhetskontrollElevAchievement.findMany({
      where: { elevId },
      include: {
        achievement: true
      },
      orderBy: { oppnaddDato: 'desc' }
    });

    // Hent alle achievements for å vise fremgang
    const alleAchievements = await prisma.sikkerhetskontrollAchievement.findMany({
      where: { aktiv: true },
      orderBy: { type: 'asc' }
    });

    res.json({
      oppnadde: elevAchievements,
      alle: alleAchievements
    });
  })
);

// ============================================================================
// TEST-MODUS OG QUIZ
// ============================================================================

// Generer smart test (vektede spørsmål basert på svake punkter)
router.post("/smart-test", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    const { klasseId, antallSporsmal = 5 } = req.body;

    // Hent elevens progresjon for å identifisere svake punkter
    const progresjon = await prisma.sikkerhetskontrollElevProgresjon.findMany({
      where: { 
        elevId,
        klasseId,
        sporsmal: { aktiv: true }
      },
      include: {
        sporsmal: {
          include: {
            kategori: true,
            media: true
          }
        }
      }
    });

    // Implementer smart-test algoritme
    const smartSporšmal = genererSmartTest(progresjon, antallSporsmal);

    res.json({
      sporšmal: smartSporšmal,
      testType: 'smart',
      antall: smartSporšmal.length
    });
  })
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Generer smart test basert på elevens svakheter
function genererSmartTest(progresjon: any[], antall: number) {
  // Beregn vektning for hvert spørsmål
  const vektedeSporšmal = progresjon.map(p => {
    let vekt = 1;
    
    // Øk vekt for gale svar
    vekt += p.antallGaleForsok * 3;
    
    // Øk vekt for vanskelige spørsmål
    if (p.status === 'VANSKELIG') vekt += 2;
    
    // Øk vekt for gamle interaksjoner (glemme-kurven)
    const dagerSiden = Math.floor((Date.now() - p.sisteInteraksjonDato.getTime()) / (1000 * 60 * 60 * 24));
    if (dagerSiden > 7) vekt += dagerSiden / 7;
    
    return { ...p, vekt };
  });

  // Sorter etter vekt og ta de høyeste
  return vektedeSporšmal
    .sort((a, b) => b.vekt - a.vekt)
    .slice(0, antall)
    .map(p => p.sporsmal);
}

// Sjekk og tildel achievements basert på progresjon
async function sjekkAchievements(elevId: number) {
  // Hent elevens nåværende progresjon
  const progresjon = await prisma.sikkerhetskontrollElevProgresjon.findMany({
    where: { elevId },
    include: {
      sporsmal: {
        include: { kategori: true }
      }
    }
  });

  // Eksempel: "Lysmester" - mestret alle lys-spørsmål
  const lysSporsmal = progresjon.filter(p => 
    p.sporsmal && p.sporsmal.kategori.navn.toLowerCase().includes('lys')
  );
  
  if (lysSporsmal.length > 0 && lysSporsmal.every(p => p.status === 'MESTRET')) {
    await tildelAchievement(elevId, 'Lysmester');
  }

  // Eksempel: "God Start" - første test fullført
  const antallMestret = progresjon.filter(p => p.status === 'MESTRET').length;
  if (antallMestret >= 5) {
    await tildelAchievement(elevId, 'God Start');
  }

  // Legg til flere achievement-logikk her...
}

// Tildel achievement til elev
async function tildelAchievement(elevId: number, achievementNavn: string) {
  const achievement = await prisma.sikkerhetskontrollAchievement.findUnique({
    where: { navn: achievementNavn }
  });

  if (!achievement) return;

  // Sjekk om eleven allerede har denne
  const eksisterende = await prisma.sikkerhetskontrollElevAchievement.findUnique({
    where: {
      unique_elev_achievement: {
        elevId,
        achievementId: achievement.id
      }
    }
  });

  if (eksisterende) return;

  // Tildel achievement
  await prisma.sikkerhetskontrollElevAchievement.create({
    data: {
      elevId,
      achievementId: achievement.id
    }
  });

  logger.info('Achievement tildelt', {
    elevId,
    achievement: achievementNavn
  });
}

// Oppdater kategori-mestring basert på testresultat
router.post('/kategorier/:kategoriId/mestring', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { kategoriId } = req.params;
    const { score, testType = 'kategori_test' } = req.body;
    const elevId = req.bruker!.id;

    // Sjekk om kategorien er mestret (80% eller høyere)
    const mestret = score >= 80;

    if (mestret) {
      // Oppdater eller opprett progresjon for kategorien
      await prisma.sikkerhetskontrollElevProgresjon.upsert({
        where: {
          id: 0 // Placeholder - will be handled by create/update logic
        },
        update: {
          mestret: true,
          mestretDato: new Date(),
          sisteAktivitet: new Date()
        },
        create: {
          elevId,
          kategoriId: parseInt(kategoriId),
          mestret: true,
          mestretDato: new Date(),
          sisteAktivitet: new Date(),
          totalTid: 0,
          antallSporsmalSett: 0
        }
      });

      // Sjekk for achievements relatert til mestring
      // Enkel achievement-sjekk - kan utvides senere
      await sjekkOgTildelAchievements(elevId, parseInt(kategoriId), score);

      // Sjekk om alle kategorier i klassen er mestret
      const kategori = await prisma.sikkerhetskontrollKategori.findUnique({
        where: { id: parseInt(kategoriId) },
        include: { klasse: true }
      });

      if (kategori) {
        const alleKategorier = await prisma.sikkerhetskontrollKategori.findMany({
          where: { klasseId: kategori.klasseId }
        });

        const mestredeKategorier = await prisma.sikkerhetskontrollElevProgresjon.findMany({
          where: {
            elevId,
            kategoriId: { in: alleKategorier.map(k => k.id) },
            mestret: true
          }
        });

        if (mestredeKategorier.length === alleKategorier.length) {
          // Alle kategorier mestret - gi klasse-mestring achievement
          await sjekkKlasseMestringAchievement(elevId, kategori.klasseId);
        }
      }
    }

    res.json({ success: true, mestret });
  } catch (error) {
    console.error('Feil ved oppdatering av kategori-mestring:', error);
    res.status(500).json({ error: 'Kunne ikke oppdatere mestring' });
  }
});

// Hent bil-informasjon for elev
router.get("/min-bil", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    logger.info('Henter Min Bil data', { userId: elevId });

    try {
      // Hent bil-informasjon fra database (eller opprett mock data)
      const bilInfo = await hentEllerOpprettBilInfo(elevId);
      
      res.json({
        success: true,
        data: bilInfo
      });
    } catch (error) {
      logger.error('Feil ved henting av bil-info', { error, userId: elevId });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke hente bil-informasjon'
      });
    }
  })
);

// Oppdater registreringsnummer
router.post("/min-bil/registreringsnummer", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    const { registreringsnummer } = req.body;
    
    logger.info('Oppdaterer registreringsnummer', { userId: elevId, registreringsnummer });

    try {
      // I produksjon: Valider mot Statens Vegvesen API
      const bilInfo = await oppdaterRegistreringsnummer(elevId, registreringsnummer);
      
      res.json({
        success: true,
        data: bilInfo,
        message: 'Registreringsnummer oppdatert'
      });
    } catch (error) {
      logger.error('Feil ved oppdatering av registreringsnummer', { error, userId: elevId });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke oppdatere registreringsnummer'
      });
    }
  })
);

// Legg til service-oppføring
router.post("/min-bil/service", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    const { type, dato, beskrivelse, kostnad, verksted } = req.body;
    
    logger.info('Legger til service-oppføring', { userId: elevId, type });

    try {
      const serviceOppforing = await leggTilServiceOppforing(elevId, {
        type,
        dato: new Date(dato),
        beskrivelse,
        kostnad,
        verksted
      });
      
      res.json({
        success: true,
        data: serviceOppforing,
        message: 'Service-oppføring lagt til'
      });
    } catch (error) {
      logger.error('Feil ved tillegging av service', { error, userId: elevId });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke legge til service-oppføring'
      });
    }
  })
);

// Sett dekkskift-påminnelse
router.post("/min-bil/dekkskift-paaminnelse", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    const { type, dato } = req.body; // 'vinter' | 'sommer', dato
    
    logger.info('Setter dekkskift-påminnelse', { userId: elevId, type, dato });

    try {
      const paaminnelse = await settDekkskiftPaaminnelse(elevId, type, new Date(dato));
      
      res.json({
        success: true,
        data: paaminnelse,
        message: 'Dekkskift-påminnelse satt'
      });
    } catch (error) {
      logger.error('Feil ved setting av dekkskift-påminnelse', { error, userId: elevId });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke sette påminnelse'
      });
    }
  })
);

// Hent partnertilbud
router.get("/min-bil/partnertilbud", 
  verifyToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const elevId = req.bruker!.id;
    logger.info('Henter partnertilbud', { userId: elevId });

    try {
      const tilbud = await hentPartnertilbud(elevId);
      
      res.json({
        success: true,
        data: tilbud
      });
    } catch (error) {
      logger.error('Feil ved henting av partnertilbud', { error, userId: elevId });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke hente tilbud'
      });
    }
  })
);

// ============================================================================
// HJELPEFUNKSJONER FOR MIN BIL HUB
// ============================================================================

async function hentEllerOpprettBilInfo(elevId: number) {
  // I produksjon: Hent fra database, opprett hvis ikke finnes
  return {
    registreringsnummer: null,
    euKontroll: {
      nesteDato: '2025-03-15',
      dagerIgjen: 90,
      status: 'GYLDIG'
    },
    dekkskift: {
      sisteDato: '2024-04-15',
      type: 'SOMMER',
      nestePaaminnelse: '2024-10-01'
    },
    serviceLogg: [
      {
        id: 1,
        type: 'Oljeskift',
        dato: '2024-08-15',
        beskrivelse: 'Oljeskift og filter',
        kostnad: 890,
        verksted: 'AutoService AS'
      },
      {
        id: 2,
        type: 'Bremseskiver',
        dato: '2024-05-03',
        beskrivelse: 'Nye bremseskiver foran',
        kostnad: 2400,
        verksted: 'Dekk & Service'
      }
    ]
  };
}

async function oppdaterRegistreringsnummer(elevId: number, registreringsnummer: string) {
  // I produksjon: Valider mot Statens Vegvesen API og lagre i database
  logger.info('Validerer registreringsnummer mot Statens Vegvesen', { registreringsnummer });
  
  // Mock validering
  if (!/^[A-Z]{2}\d{5}$/.test(registreringsnummer)) {
    throw new Error('Ugyldig registreringsnummer format');
  }
  
  return await hentEllerOpprettBilInfo(elevId);
}

async function leggTilServiceOppforing(elevId: number, service: any) {
  // I produksjon: Lagre i database
  return {
    id: Date.now(),
    ...service,
    elevId,
    opprettet: new Date()
  };
}

async function settDekkskiftPaaminnelse(elevId: number, type: string, dato: Date) {
  // I produksjon: Lagre påminnelse og sett opp notifikasjon
  return {
    id: Date.now(),
    elevId,
    type,
    dato,
    aktiv: true,
    opprettet: new Date()
  };
}

async function hentPartnertilbud(elevId: number) {
  // I produksjon: Hent personaliserte tilbud basert på bil-info og lokasjon
  return [
    {
      id: 'dekk-express-vinter',
      partner: 'Dekk-Express',
      type: 'DEKK',
      tittel: '20% rabatt på vinterdekk',
      beskrivelse: 'Få 20% rabatt på alle vinterdekk. Gjelder til 31. oktober.',
      rabattKode: 'TMS20VINTER',
      gyldigTil: '2024-10-31',
      url: 'https://dekk-express.no/tms-tilbud'
    },
    {
      id: 'autoservice-eu',
      partner: 'AutoService',
      type: 'SERVICE',
      tittel: 'Gratis EU-kontroll ved service',
      beskrivelse: 'Book service og få EU-kontroll gratis (verdi 590 kr)',
      rabattKode: 'TMSEU2024',
      gyldigTil: '2024-12-31',
      url: 'https://autoservice.no/book-time'
    },
    {
      id: 'trygg-forsikring',
      partner: 'TryggForsikring',
      type: 'FORSIKRING',
      tittel: '15% rabatt for TMS-elever',
      beskrivelse: 'Spesialtilbud på bilforsikring for kjøreskoleelever',
      rabattKode: 'TMS15',
      gyldigTil: '2025-06-30',
      url: 'https://tryggforsikring.no/tms'
    }
  ];
}

// Helper-funksjoner for achievements
async function sjekkOgTildelAchievements(elevId: number, kategoriId: number, score: number) {
  try {
    // Hent kategori for å finne navn
    const kategori = await prisma.sikkerhetskontrollKategori.findUnique({
      where: { id: kategoriId }
    });

    if (!kategori) return;

    // Sjekk for kategori-spesifikke achievements
    const categoryAchievements = await prisma.sikkerhetskontrollAchievement.findMany({
      where: {
        type: 'FERDIGHET',
        navn: {
          contains: kategori.navn,
          mode: 'insensitive'
        }
      }
    });

    for (const achievement of categoryAchievements) {
      // Sjekk om eleven allerede har dette achievement
      const existing = await prisma.sikkerhetskontrollElevAchievement.findFirst({
        where: {
          elevId,
          achievementId: achievement.id
        }
      });

      if (!existing && score >= 80) {
        // Tildel achievement
        await prisma.sikkerhetskontrollElevAchievement.create({
          data: {
            elevId,
            achievementId: achievement.id
          }
        });
      }
    }
  } catch (error) {
    console.error('Feil ved sjekk av achievements:', error);
  }
}

async function sjekkKlasseMestringAchievement(elevId: number, klasseId: number) {
  try {
    // Finn "Fullført Klasse" achievement
    const klasseAchievement = await prisma.sikkerhetskontrollAchievement.findFirst({
      where: {
        type: 'FERDIGHET',
        navn: {
          contains: 'Fullført',
          mode: 'insensitive'
        }
      }
    });

    if (klasseAchievement) {
      // Sjekk om eleven allerede har dette achievement
      const existing = await prisma.sikkerhetskontrollElevAchievement.findFirst({
        where: {
          elevId,
          achievementId: klasseAchievement.id
        }
      });

      if (!existing) {
        // Tildel achievement
        await prisma.sikkerhetskontrollElevAchievement.create({
          data: {
            elevId,
            achievementId: klasseAchievement.id
          }
        });
      }
    }
  } catch (error) {
    console.error('Feil ved sjekk av klasse-achievement:', error);
  }
}

// Hent spørsmål for testkandidat-test (20 spørsmål, blandet flervalg og skriftlig)
router.get('/kategorier/:kategoriId/testkandidat-sporsmal', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { kategoriId } = req.params;

    const sporsmal = await prisma.sikkerhetskontrollSporsmal.findMany({
      where: {
        kategoriId: parseInt(kategoriId),
        aktiv: true
      },
      include: {
        media: {
          orderBy: { rekkefolge: 'asc' }
        }
      },
      orderBy: { rekkefolge: 'asc' }
    });

    // Generer flervalgs-alternativer for hvert spørsmål
    const testkandidat_sporsmal = sporsmal.map(sp => {
      // Simuler at 50% er flervalg, 50% skriftlig
      const erFlervalg = Math.random() > 0.5;
      
      if (erFlervalg) {
        // Generer 4 alternativer basert på riktig svar
        const riktigSvar = sp.svarKort;
        const svaralternativer = [riktigSvar];
        
        // Legg til 3 feilsvar (enkle variasjoner)
        const feilsvar = [
          `Sjekk ${sp.sporsmalTekst.includes('brems') ? 'koblingspedalens' : 'handbremsens'} funksjon`,
          `Kontroller at ${sp.sporsmalTekst.includes('lys') ? 'blinkers' : 'varsellysene'} virker`,
          `Se etter ${sp.sporsmalTekst.includes('hjul') ? 'slitasje på felgene' : 'rust og korrosjon'}`
        ];
        
        svaralternativer.push(...feilsvar);
        
        // Bland alternativene
        for (let i = svaralternativer.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [svaralternativer[i], svaralternativer[j]] = [svaralternativer[j], svaralternativer[i]];
        }
        
        const riktigSvarIndeks = svaralternativer.findIndex(alt => alt === riktigSvar);
        
        return {
          ...sp,
          type: 'FLERVALG',
          svaralternativer,
          riktigSvarIndeks
        };
      } else {
        return {
          ...sp,
          type: 'SKRIFTLIG'
        };
      }
    });

    res.json(testkandidat_sporsmal);
  } catch (error) {
    console.error('Feil ved henting av testkandidat-spørsmål:', error);
    res.status(500).json({ error: 'Kunne ikke hente testkandidat-spørsmål' });
  }
});

// Media upload API
router.post('/media/upload', verifyToken, upload.single('media'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ingen fil ble lastet opp' });
    }

    const { sporsmalId, type } = req.body;
    
    if (!sporsmalId) {
      return res.status(400).json({ error: 'sporsmalId er pakrevd' });
    }

    // Sjekk at spørsmålet eksisterer
    const sporsmal = await prisma.sikkerhetskontrollSporsmal.findUnique({
      where: { id: parseInt(sporsmalId) }
    });

    if (!sporsmal) {
      return res.status(404).json({ error: 'Spørsmål ikke funnet' });
    }

    // Bestem media type basert på filtype
    let mediaType = type || 'BILDE';
    if (req.file.mimetype.startsWith('video/')) {
      mediaType = 'VIDEO';
    } else if (req.file.mimetype.startsWith('audio/')) {
      mediaType = 'LYDFIL';
    }

    // Generer URL for å servere filen
    const fileUrl = `/uploads/media/${req.file.filename}`;

    // Lagre media informasjon i database
    const media = await prisma.sikkerhetskontrollMedia.create({
      data: {
        sporsmalId: parseInt(sporsmalId),
        mediaType: mediaType as any,
        url: fileUrl,
        altTekst: req.file.originalname,
        tittel: req.file.originalname.split('.')[0], // Filnavn uten extension
        rekkefolge: 1 // Kan optimaliseres til å finne neste rekkefolge
      }
    });

    res.json({
      id: media.id,
      url: fileUrl,
      type: mediaType,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Feil ved media upload:', error);
    res.status(500).json({ error: 'Kunne ikke laste opp media' });
  }
});

// Serve statiske media filer
router.use('/uploads', (req, res, next) => {
  // Verifiser at brukeren er autentisert for å få tilgang til media
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Ikke autorisert' });
  }
  next();
});

// Leaderboard API
router.get('/leaderboard', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { type = 'global' } = req.query;
    const currentUserId = req.bruker?.id;

    let whereClause: any = {};
    let dateFilter: any = {};

    // Filtrering basert på type
    if (type === 'school' && req.bruker?.bedriftId) {
      whereClause.bedriftId = req.bruker.bedriftId;
    } else if (type === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter.gte = oneWeekAgo;
    }

    // Hent leaderboard data - simulerer med eksisterende brukere
    const users = await prisma.ansatt.findMany({
      where: whereClause,
      take: 50, // Top 50
      orderBy: { id: 'asc' }, // Vil bli sortert etter XP senere
      include: {
        bedrift: {
          select: { navn: true }
        }
      }
    });

    // Simuler leaderboard data (i produksjon ville dette vært ekte data)
    const leaderboardData = await Promise.all(users.map(async (user, index) => {
      // Simuler XP basert på progresjon
      const elevProgresjon = await prisma.sikkerhetskontrollElevProgresjon.findMany({
        where: {
          elevId: user.id,
          ...(Object.keys(dateFilter).length > 0 ? { oppdatert: dateFilter } : {})
        }
      });

      const elevAchievements = await prisma.sikkerhetskontrollElevAchievement.findMany({
        where: { elevId: user.id }
      });

      // Beregn stats
      const kategorierMestret = elevProgresjon.filter(p => p.mestret).length;
      const totalKategorier = 5; // Antall kategorier for Klasse B
      const totalXP = kategorierMestret * 100 + elevAchievements.length * 50 + Math.random() * 500;
      const streak = Math.floor(Math.random() * 20);
      const level = Math.floor(totalXP / 200) + 1;

      return {
        id: user.id,
        elevNavn: `${user.fornavn} ${user.etternavn}`,
        skole: user.bedrift?.navn,
        totalXP: Math.round(totalXP),
        level,
        achievements: elevAchievements.length,
        kategorierMestret,
        totalKategorier,
        streak,
        rank: 0, // Vil bli satt etter sortering
        isCurrentUser: user.id === currentUserId
      };
    }));

    // Sorter etter XP og sett rank
    leaderboardData.sort((a, b) => b.totalXP - a.totalXP);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Finn current user sin posisjon
    const currentUser = leaderboardData.find(entry => entry.isCurrentUser);

    // Beregn statistikk
    const stats = {
      totalUsers: leaderboardData.length,
      averageXP: leaderboardData.reduce((sum, user) => sum + user.totalXP, 0) / leaderboardData.length,
      topStreak: Math.max(...leaderboardData.map(user => user.streak)),
      mostActiveDay: ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'][Math.floor(Math.random() * 5)]
    };

    res.json({
      leaderboard: leaderboardData,
      currentUser,
      stats
    });

  } catch (error) {
    console.error('Feil ved henting av leaderboard:', error);
    res.status(500).json({ error: 'Kunne ikke hente leaderboard data' });
  }
});

export default router; 
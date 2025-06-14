import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route GET /api/reference/sjekkpunkt-systemer
 * @desc Hent alle sjekkpunkt-systemer
 * @access Public
 */
router.get('/sjekkpunkt-systemer', async (req, res) => {
  try {
    const systemer = await prisma.sjekkpunktSystem.findMany({
      where: {
        aktiv: true
      },
      orderBy: {
        rekkefølge: 'asc'
      }
    });

    res.json({
      success: true,
      data: systemer,
      message: `Hentet ${systemer.length} sjekkpunkt-systemer`
    });
  } catch (error) {
    console.error('Feil ved henting av sjekkpunkt-systemer:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente sjekkpunkt-systemer',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/foererkort-klasser
 * @desc Hent alle førerkortklass-referanser
 * @access Public
 */
router.get('/foererkort-klasser', async (req, res) => {
  try {
    const { kategori } = req.query;
    
    const where: any = {
      aktiv: true
    };
    
    if (kategori) {
      where.kategori = kategori;
    }

    const klasser = await prisma.førerkortKlasse.findMany({
      where,
      orderBy: [
        { kategori: 'asc' },
        { kode: 'asc' }
      ]
    });

    // Gruppér etter kategori hvis ingen spesifikk kategori er forespurt
    const result = kategori ? klasser : klasser.reduce((acc: any, klasse) => {
      const cat = klasse.kategori || 'Annet';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(klasse);
      return acc;
    }, {});

    res.json({
      success: true,
      data: result,
      message: `Hentet ${klasser.length} førerkortklass-referanser`
    });
  } catch (error) {
    console.error('Feil ved henting av førerkortklass-referanser:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente førerkortklass-referanser',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/quiz-kategorier
 * @desc Hent alle quiz-kategorier
 * @access Public
 */
router.get('/quiz-kategorier', async (req, res) => {
  try {
    const kategorier = await prisma.quizKategori.findMany({
      orderBy: {
        navn: 'asc'
      },
      include: {
        _count: {
          select: {
            sporsmal: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: kategorier,
      message: `Hentet ${kategorier.length} quiz-kategorier`
    });
  } catch (error) {
    console.error('Feil ved henting av quiz-kategorier:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente quiz-kategorier',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/sikkerhetskontroll-kategorier
 * @desc Hent sikkerhetskontroll-kategorier
 * @access Public
 */
router.get('/sikkerhetskontroll-kategorier', async (req, res) => {
  try {
    const { klasseId } = req.query;
    
    const where: any = {
      aktiv: true
    };
    
    if (klasseId) {
      where.klasseId = parseInt(klasseId as string);
    }

    const kategorier = await prisma.sikkerhetskontrollKategori.findMany({
      where,
      include: {
        klasse: true,
        _count: {
          select: {
            sporsmal: true
          }
        }
      },
      orderBy: [
        { klasseId: 'asc' },
        { rekkefølge: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: kategorier,
      message: `Hentet ${kategorier.length} sikkerhetskontroll-kategorier`
    });
  } catch (error) {
    console.error('Feil ved henting av sikkerhetskontroll-kategorier:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente sikkerhetskontroll-kategorier',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/foererkort-kategorier
 * @desc Hent alle førerkort-kategorier
 * @access Public
 */
router.get('/foererkort-kategorier', async (req, res) => {
  try {
    // Hent unike kategorier fra FørerkortKlasse tabellen
    const kategorier = await prisma.førerkortKlasse.findMany({
      where: {
        aktiv: true,
        kategori: {
          not: null
        }
      },
      select: {
        kategori: true
      },
      distinct: ['kategori'],
      orderBy: {
        kategori: 'asc'
      }
    });

    // Konverter til enkel array av strenger
    const kategoriListe = kategorier
      .map(k => k.kategori)
      .filter(k => k !== null) as string[];

    res.json({
      success: true,
      data: kategoriListe,
      message: `Hentet ${kategoriListe.length} førerkort-kategorier`
    });
  } catch (error) {
    console.error('Feil ved henting av førerkort-kategorier:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente førerkort-kategorier',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/ansatt-roller
 * @desc Hent alle ansatt-roller
 * @access Public
 */
router.get('/ansatt-roller', async (req, res) => {
  try {
    // Hent roller fra AnsattRolle enum
    const roller = ['ADMIN', 'HOVEDBRUKER', 'TRAFIKKLARER'];
    
    res.json({
      success: true,
      data: roller,
      message: `Hentet ${roller.length} ansatt-roller`
    });
  } catch (error) {
    console.error('Feil ved henting av ansatt-roller:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente ansatt-roller',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/system-roller
 * @desc Hent alle system-roller (inkludert elev og bedrift)
 * @access Public
 */
router.get('/system-roller', async (req, res) => {
  try {
    // Hent alle roller som brukes i systemet
    const roller = ['ADMIN', 'HOVEDBRUKER', 'TRAFIKKLARER', 'ELEV', 'BEDRIFT'];
    
    res.json({
      success: true,
      data: roller,
      message: `Hentet ${roller.length} system-roller`
    });
  } catch (error) {
    console.error('Feil ved henting av system-roller:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente system-roller',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/filstorrelser
 * @desc Hent filstørrelse-enheter
 * @access Public
 */
router.get('/filstorrelser', async (req, res) => {
  try {
    const { format } = req.query;
    
    // Støtter både lang og kort format
    const langFormat = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const kortFormat = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    const enheter = format === 'kort' ? kortFormat : langFormat;
    
    res.json({
      success: true,
      data: enheter,
      message: `Hentet ${enheter.length} filstørrelse-enheter (${format === 'kort' ? 'kort' : 'lang'} format)`
    });
  } catch (error) {
    console.error('Feil ved henting av filstørrelse-enheter:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente filstørrelse-enheter',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/ukedager
 * @desc Hent ukedager på norsk
 * @access Public
 */
router.get('/ukedager', async (req, res) => {
  try {
    const { format } = req.query;
    
    // Støtter både kort og lang format - starter på mandag
    const kortFormat = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    const langFormat = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
    
    const dager = format === 'lang' ? langFormat : kortFormat;
    
    res.json({
      success: true,
      data: dager,
      message: `Hentet ${dager.length} ukedager (${format === 'lang' ? 'lang' : 'kort'} format)`
    });
  } catch (error) {
    console.error('Feil ved henting av ukedager:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente ukedager',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/maaneder
 * @desc Hent månedsnavn på norsk
 * @access Public
 */
router.get('/maaneder', async (req, res) => {
  try {
    const { format } = req.query;
    
    // Støtter både kort og lang format
    const kortFormat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const langFormat = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
    
    const maaneder = format === 'kort' ? kortFormat : langFormat;
    
    res.json({
      success: true,
      data: maaneder,
      message: `Hentet ${maaneder.length} måneder (${format === 'kort' ? 'kort' : 'lang'} format)`
    });
  } catch (error) {
    console.error('Feil ved henting av måneder:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente måneder',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/nyhet-prioriteter
 * @desc Hent nyhetsprioriteringer
 * @access Public
 */
router.get('/nyhet-prioriteter', async (req, res) => {
  try {
    const prioriteter = [
      { verdi: 'lav', navn: 'Lav', farge: 'bg-gray-100 text-gray-600' },
      { verdi: 'medium', navn: 'Medium', farge: 'bg-yellow-100 text-yellow-800' },
      { verdi: 'høy', navn: 'Høy', farge: 'bg-orange-100 text-orange-800' },
      { verdi: 'kritisk', navn: 'Kritisk', farge: 'bg-red-100 text-red-800' }
    ];
    
    res.json({
      success: true,
      data: prioriteter,
      message: `Hentet ${prioriteter.length} prioriteringer`
    });
  } catch (error) {
    console.error('Feil ved henting av nyhetsprioriteringer:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente nyhetsprioriteringer',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/nyhet-kategorier
 * @desc Hent nyhetskategorier
 * @access Public
 */
router.get('/nyhet-kategorier', async (req, res) => {
  try {
    const kategorier = [
      { verdi: 'sikkerhet', navn: 'Sikkerhet', farge: 'bg-red-100 text-red-800 border-red-200', icon: 'FaShieldAlt' },
      { verdi: 'system', navn: 'System', farge: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'FaCog' },
      { verdi: 'bedrift', navn: 'Bedrift', farge: 'bg-green-100 text-green-800 border-green-200', icon: 'FaBuilding' },
      { verdi: 'generell', navn: 'Generell', farge: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'FaBullhorn' }
    ];
    
    res.json({
      success: true,
      data: kategorier,
      message: `Hentet ${kategorier.length} kategorier`
    });
  } catch (error) {
    console.error('Feil ved henting av nyhetskategorier:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente nyhetskategorier',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/kontrakt-statuser
 * @desc Hent kontrakt-statuser med styling
 * @access Public
 */
router.get('/kontrakt-statuser', async (req, res) => {
  try {
    const statuser = [
      { 
        verdi: 'KLADD', 
        navn: 'Kladd', 
        farge: 'bg-gray-100 text-gray-800',
        icon: 'FiSearch',
        beskrivelse: 'Kontrakt under utarbeidelse'
      },
      { 
        verdi: 'AKTIV', 
        navn: 'Aktiv', 
        farge: 'bg-purple-100 text-purple-800',
        icon: 'FiClock',
        beskrivelse: 'Aktiv kontrakt'
      },
      { 
        verdi: 'AVSLUTTET', 
        navn: 'Avsluttet', 
        farge: 'bg-gray-100 text-gray-600',
        icon: 'FiCheck',
        beskrivelse: 'Fullført kontrakt'
      }
    ];
    
    res.json({
      success: true,
      data: statuser,
      message: `Hentet ${statuser.length} kontrakt-statuser`
    });
  } catch (error) {
    console.error('Feil ved henting av kontrakt-statuser:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente kontrakt-statuser',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/api-statuser
 * @desc Hent API-statuser med styling
 * @access Public
 */
router.get('/api-statuser', async (req, res) => {
  try {
    const statuser = [
      { verdi: 'AKTIV', navn: 'Aktiv', farge: 'bg-green-100 text-green-800', icon: 'CheckCircleIcon' },
      { verdi: 'INAKTIV', navn: 'Inaktiv', farge: 'bg-gray-100 text-gray-800', icon: 'XCircleIcon' },
      { verdi: 'UTLØPT', navn: 'Utløpt', farge: 'bg-red-100 text-red-800', icon: 'XCircleIcon' },
      { verdi: 'SUSPENDERT', navn: 'Suspendert', farge: 'bg-yellow-100 text-yellow-800', icon: 'ExclamationTriangleIcon' },
      { verdi: 'TILKOBLET', navn: 'Tilkoblet', farge: 'bg-green-100 text-green-800', icon: 'CheckCircleIcon' },
      { verdi: 'FRAKOBLET', navn: 'Frakoblet', farge: 'bg-gray-100 text-gray-800', icon: 'XCircleIcon' },
      { verdi: 'FEIL', navn: 'Feil', farge: 'bg-red-100 text-red-800', icon: 'XCircleIcon' },
      { verdi: 'KONFIGURERER', navn: 'Konfigurerer', farge: 'bg-yellow-100 text-yellow-800', icon: 'CogIcon' }
    ];
    
    res.json({
      success: true,
      data: statuser,
      message: `Hentet ${statuser.length} API-statuser`
    });
  } catch (error) {
    console.error('Feil ved henting av API-statuser:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente API-statuser',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/api-typer
 * @desc Hent API-typer med styling
 * @access Public
 */
router.get('/api-typer', async (req, res) => {
  try {
    const typer = [
      { verdi: 'READ_ONLY', navn: 'Kun Lesing', farge: 'bg-blue-100 text-blue-800' },
      { verdi: 'READ_WRITE', navn: 'Lese/Skrive', farge: 'bg-green-100 text-green-800' },
      { verdi: 'ADMIN', navn: 'Administrator', farge: 'bg-red-100 text-red-800' }
    ];
    
    res.json({
      success: true,
      data: typer,
      message: `Hentet ${typer.length} API-typer`
    });
  } catch (error) {
    console.error('Feil ved henting av API-typer:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente API-typer',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/rolle-konfigurasjoner
 * @desc Hent rolle-konfigurasjoner med farger og navn
 * @access Public
 */
router.get('/rolle-konfigurasjoner', async (req, res) => {
  try {
    const roller = [
      { 
        verdi: 'ADMIN', 
        navn: 'Administrator', 
        farge: 'bg-red-100 text-red-800',
        beskrivelse: 'Full systemtilgang'
      },
      { 
        verdi: 'HOVEDBRUKER', 
        navn: 'Hovedbruker', 
        farge: 'bg-blue-100 text-blue-800',
        beskrivelse: 'Utvidet tilgang til systemfunksjoner'
      },
      { 
        verdi: 'TRAFIKKLARER', 
        navn: 'Trafikklærer', 
        farge: 'bg-green-100 text-green-800',
        beskrivelse: 'Tilgang til undervisning og elevoppfølging'
      },
      { 
        verdi: 'ELEV', 
        navn: 'Elev', 
        farge: 'bg-gray-100 text-gray-800',
        beskrivelse: 'Grunnleggende elevatilgang'
      }
    ];
    
    res.json({
      success: true,
      data: roller,
      message: `Hentet ${roller.length} rolle-konfigurasjoner`
    });
  } catch (error) {
    console.error('Feil ved henting av rolle-konfigurasjoner:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente rolle-konfigurasjoner',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/seed-config
 * @desc Hent seed-data konfigurasjon
 * @access Private (Admin only)
 */
router.get('/seed-config', verifyToken, async (req, res) => {
  try {
    const config = await prisma.seedDataConfig.findMany({
      orderBy: {
        type: 'asc'
      }
    });

    res.json({
      success: true,
      data: config,
      message: `Hentet ${config.length} konfigurasjon-elementer`
    });
  } catch (error) {
    console.error('Feil ved henting av seed-konfigurasjon:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente seed-konfigurasjon',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

// ============================================================================
// ADMIN ENDPOINTS - Protected routes for managing reference data
// ============================================================================

/**
 * @route POST /api/reference/admin/sjekkpunkt-systemer
 * @desc Opprett nytt sjekkpunkt-system
 * @access Private (Admin only)
 */
router.post('/admin/sjekkpunkt-systemer', verifyToken, async (req, res) => {
  try {
    const { navn, beskrivelse, ikon, rekkefølge } = req.body;

    if (!navn) {
      return res.status(400).json({
        success: false,
        message: 'Navn er påkrevd'
      });
    }

    const system = await prisma.sjekkpunktSystem.create({
      data: {
        navn,
        beskrivelse,
        ikon,
        rekkefølge
      }
    });

    res.status(201).json({
      success: true,
      data: system,
      message: 'Sjekkpunkt-system opprettet'
    });
  } catch (error) {
    console.error('Feil ved opprettelse av sjekkpunkt-system:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke opprette sjekkpunkt-system',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route PUT /api/reference/admin/sjekkpunkt-systemer/:id
 * @desc Oppdater sjekkpunkt-system
 * @access Private (Admin only)
 */
router.put('/admin/sjekkpunkt-systemer/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { navn, beskrivelse, ikon, rekkefølge, aktiv } = req.body;

    const system = await prisma.sjekkpunktSystem.update({
      where: { id: parseInt(id) },
      data: {
        navn,
        beskrivelse,
        ikon,
        rekkefølge,
        aktiv
      }
    });

    res.json({
      success: true,
      data: system,
      message: 'Sjekkpunkt-system oppdatert'
    });
  } catch (error) {
    console.error('Feil ved oppdatering av sjekkpunkt-system:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke oppdatere sjekkpunkt-system',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route POST /api/reference/admin/førerkort-klasser
 * @desc Opprett ny førerkortklass
 * @access Private (Admin only)
 */
router.post('/admin/førerkort-klasser', verifyToken, async (req, res) => {
  try {
    const { kode, navn, beskrivelse, kategori, minimumsalder, krav } = req.body;

    if (!kode || !navn) {
      return res.status(400).json({
        success: false,
        message: 'Kode og navn er påkrevd'
      });
    }

    const klasse = await prisma.førerkortKlasse.create({
      data: {
        kode,
        navn,
        beskrivelse,
        kategori,
        minimumsalder,
        krav: krav || []
      }
    });

    res.status(201).json({
      success: true,
      data: klasse,
      message: 'Førerkortklass opprettet'
    });
  } catch (error) {
    console.error('Feil ved opprettelse av førerkortklass:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke opprette førerkortklass',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route DELETE /api/reference/admin/sjekkpunkt-systemer/:id
 * @desc Slett sjekkpunkt-system
 * @access Private (Admin only)
 */
router.delete('/admin/sjekkpunkt-systemer/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.sjekkpunktSystem.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Sjekkpunkt-system slettet'
    });
  } catch (error) {
    console.error('Feil ved sletting av sjekkpunkt-system:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke slette sjekkpunkt-system',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route PUT /api/reference/admin/foererkort-klasser/:id
 * @desc Oppdater førerkortklass
 * @access Private (Admin only)
 */
router.put('/admin/foererkort-klasser/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, navn, beskrivelse, kategori, minimumsalder, krav, aktiv } = req.body;

    const klasse = await prisma.førerkortKlasse.update({
      where: { id: parseInt(id) },
      data: {
        kode,
        navn,
        beskrivelse,
        kategori,
        minimumsalder,
        krav: krav || [],
        aktiv
      }
    });

    res.json({
      success: true,
      data: klasse,
      message: 'Førerkortklass oppdatert'
    });
  } catch (error) {
    console.error('Feil ved oppdatering av førerkortklass:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke oppdatere førerkortklass',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route DELETE /api/reference/admin/foererkort-klasser/:id
 * @desc Slett førerkortklass
 * @access Private (Admin only)
 */
router.delete('/admin/foererkort-klasser/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.førerkortKlasse.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Førerkortklass slettet'
    });
  } catch (error) {
    console.error('Feil ved sletting av førerkortklass:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke slette førerkortklass',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route PUT /api/reference/admin/seed-config/:type
 * @desc Oppdater seed-konfigurasjon
 * @access Private (Admin only)
 */
router.put('/admin/seed-config/:type', verifyToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { enabled, beskrivelse } = req.body;

    const config = await prisma.seedDataConfig.update({
      where: { type },
      data: {
        enabled,
        beskrivelse
      }
    });

    res.json({
      success: true,
      data: config,
      message: 'Seed-konfigurasjon oppdatert'
    });
  } catch (error) {
    console.error('Feil ved oppdatering av seed-konfigurasjon:', error);
    res.status(500).json({
      success: false,
      message: 'Kunne ikke oppdatere seed-konfigurasjon',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

/**
 * @route GET /api/reference/health
 * @desc Health check for reference data API
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const [systemer, klasser, quizKategorier] = await Promise.all([
      prisma.sjekkpunktSystem.count({ where: { aktiv: true } }),
      prisma.førerkortKlasse.count({ where: { aktiv: true } }),
      prisma.quizKategori.count()
    ]);

    res.json({
      success: true,
      data: {
        sjekkpunkt_systemer: systemer,
        førerkort_klasser: klasser,
        quiz_kategorier: quizKategorier,
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      message: 'Reference data API er operativ'
    });
  } catch (error) {
    console.error('Feil ved health check:', error);
    res.status(500).json({
      success: false,
      message: 'Reference data API ikke tilgjengelig',
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
  }
});

export default router; 
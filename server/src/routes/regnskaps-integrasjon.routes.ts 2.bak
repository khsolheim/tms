/**
 * Regnskapsintegrasjon Routes
 * 
 * API endpoints for konfigurasjon og styring av regnskapsintegrasjoner
 */

import { Router, Request, Response } from 'express';
import { verifyToken, sjekkRolle } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import logger from '../utils/logger';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const regnskapsKonfigurasjonSchema = z.object({
  body: z.object({
    system: z.enum(['TRIPLETEX', 'POWEROFFICE', 'FIKEN', 'CUSTOM']),
    apiUrl: z.string().url(),
    apiKey: z.string().min(1),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    autoSyncEnabled: z.boolean().default(false),
    syncInterval: z.number().min(5).default(30),
    defaultMvaKode: z.string().default('25'),
    standardKontoer: z.object({
      salg: z.string().min(1),
      mva: z.string().min(1),
      kunde: z.string().min(1),
      bank: z.string().min(1)
    })
  })
});

const testForbindelseSchema = z.object({
  body: z.object({
    system: z.enum(['TRIPLETEX', 'POWEROFFICE', 'FIKEN', 'CUSTOM']),
    apiUrl: z.string().url(),
    apiKey: z.string().min(1),
    clientId: z.string().optional(),
    clientSecret: z.string().optional()
  })
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

router.use(verifyToken);
router.use(sjekkRolle(['ADMIN', 'LEDER']));

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/regnskaps-integrasjon/konfigurasjon:
 *   get:
 *     summary: Hent regnskapskonfigurasjon
 *     tags: [Regnskapsintegrasjon]
 *     security:
 *       - bearerAuth: []
 */
router.get('/konfigurasjon', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock data - implementer database lagring senere
    const mockKonfigurasjon = {
      id: 1,
      system: 'TRIPLETEX',
      apiUrl: 'https://api.tripletex.io/v2',
      autoSyncEnabled: false,
      syncInterval: 30,
      defaultMvaKode: '25',
      standardKontoer: {
        salg: '3000',
        mva: '2700',
        kunde: '1500',
        bank: '1920'
      },
      status: 'INAKTIV',
      lastSync: null,
      opprettet: new Date(),
      oppdatertDato: new Date()
    };

    res.json({
      success: true,
      data: mockKonfigurasjon
    });

  } catch (error) {
    logger.error('Feil ved henting av regnskapskonfigurasjon', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente regnskapskonfigurasjon'
    });
  }
});

/**
 * @swagger
 * /api/regnskaps-integrasjon/konfigurasjon:
 *   post:
 *     summary: Lagre regnskapskonfigurasjon
 *     tags: [Regnskapsintegrasjon]
 *     security:
 *       - bearerAuth: []
 */
router.post('/konfigurasjon', 
  validate(regnskapsKonfigurasjonSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const konfigurasjonData = req.body;

      logger.info('Regnskapskonfigurasjon lagret (mock)', {
        system: konfigurasjonData.system,
        userId: (req as any).user?.id
      });

      res.status(201).json({
        success: true,
        data: {
          id: Date.now(),
          system: konfigurasjonData.system,
          status: 'INAKTIV'
        }
      });

    } catch (error) {
      logger.error('Feil ved lagring av regnskapskonfigurasjon', error);
      res.status(500).json({
        success: false,
        error: 'Kunne ikke lagre regnskapskonfigurasjon'
      });
    }
  }
);

/**
 * @swagger
 * /api/regnskaps-integrasjon/test-forbindelse:
 *   post:
 *     summary: Test forbindelse til regnskapssystem
 *     tags: [Regnskapsintegrasjon]
 *     security:
 *       - bearerAuth: []
 */
router.post('/test-forbindelse',
  validate(testForbindelseSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { system, apiUrl, apiKey } = req.body;
      const startTime = Date.now();

      // Mock test - implementer ekte API-kall senere
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const connected = Math.random() > 0.3; // 70% sjanse for suksess
      const responseTime = Date.now() - startTime;

      logger.info('Regnskaps forbindelsestest fullført', {
        system,
        connected,
        responseTime,
        userId: (req as any).user?.id
      });

      res.json({
        success: true,
        connected,
        message: connected ? `Forbindelse til ${system} OK` : `Kunne ikke koble til ${system}`,
        responseTime,
        systemInfo: connected ? { company: 'Test Bedrift AS' } : null
      });

    } catch (error) {
      logger.error('Feil ved test av regnskapsforbindelse', error);
      res.status(500).json({
        success: false,
        error: 'Kunne ikke teste forbindelse'
      });
    }
  }
);

/**
 * @swagger
 * /api/regnskaps-integrasjon/status:
 *   get:
 *     summary: Hent integrasjonsstatus
 *     tags: [Regnskapsintegrasjon]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    // Mock status data
    res.json({
      success: true,
      data: {
        konfigurert: true,
        system: 'TRIPLETEX',
        status: 'AKTIV',
        lastSync: new Date(Date.now() - 3600000), // 1 time siden
        statistikk: {
          totaleKontrakter: 15,
          synkroniserteKontrakter: 12,
          venterpåSynkronisering: 3,
          feiletSynkronisering: 0
        }
      }
    });

  } catch (error) {
    logger.error('Feil ved henting av regnskapsstatus', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke hente status'
    });
  }
});

/**
 * @swagger
 * /api/regnskaps-integrasjon/sync:
 *   post:
 *     summary: Start manuell synkronisering
 *     tags: [Regnskapsintegrasjon]
 *     security:
 *       - bearerAuth: []
 */
router.post('/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = `sync-${Date.now()}`;
    
    logger.info('Regnskapssynkronisering startet (mock)', {
      jobId,
      userId: (req as any).user?.id
    });

    // Mock synkronisering
    setTimeout(() => {
      logger.info('Regnskapssynkronisering fullført (mock)', { jobId });
    }, 5000);

    res.json({
      success: true,
      message: 'Synkronisering startet for 3 kontrakter',
      jobId,
      estimatedDuration: 6
    });

  } catch (error) {
    logger.error('Feil ved start av regnskapssynkronisering', error);
    res.status(500).json({
      success: false,
      error: 'Kunne ikke starte synkronisering'
    });
  }
});

export default router; 
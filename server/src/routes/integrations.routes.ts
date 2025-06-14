import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import logger from '../utils/logger';
import { verifyToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const IntegrationConfigSchema = z.object({
  body: z.object({
    providerId: z.number().int().positive(),
    navn: z.string().min(1).max(100),
    aktiv: z.boolean().default(false),
    autoSync: z.boolean().default(false),
    syncInterval: z.number().int().positive().optional(),
    konfigurasjonsdata: z.object({}).passthrough(), // Encrypted config data
    syncKunder: z.boolean().default(true),
    syncFakturaer: z.boolean().default(true),
    syncProdukter: z.boolean().default(false),
    syncKontrakter: z.boolean().default(true),
    feltMapping: z.object({}).optional(),
    maxRetries: z.number().int().min(1).max(10).default(3),
    retryInterval: z.number().int().min(1).max(60).default(5),
    feilVarsling: z.boolean().default(true)
  })
});

const SyncJobSchema = z.object({
  body: z.object({
    type: z.enum(['FULL_SYNC', 'INCREMENTAL_SYNC', 'MANUAL_SYNC']),
    prioritet: z.number().int().min(1).max(10).default(5),
    planlagtTid: z.string().datetime().optional()
  })
});

// ==================== INTEGRATION PROVIDERS ====================

/**
 * GET /api/integrations/providers
 * Henter alle tilgjengelige integrasjonsleverandører
 */
router.get('/providers', verifyToken, async (req: Request, res: Response) => {
  try {
    const providers = await prisma.integrationProvider.findMany({
      where: { tilgjengelig: true },
      orderBy: [{ type: 'asc' }, { navn: 'asc' }]
    });

    res.json({
      success: true,
      data: providers,
      message: 'Integrasjonsleverandører hentet'
    });
  } catch (error) {
    logger.error('Feil ved henting av integrasjonsleverandører', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente integrasjonsleverandører'
    });
  }
});

/**
 * GET /api/integrations/providers/:type
 * Henter integrasjonsleverandører av spesifikk type
 */
router.get('/providers/:type', verifyToken, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    const providers = await prisma.integrationProvider.findMany({
      where: { 
        type,
        tilgjengelig: true 
      },
      orderBy: { navn: 'asc' }
    });

    res.json({
      success: true,
      data: providers,
      message: `${type} integrasjonsleverandører hentet`
    });
  } catch (error) {
    logger.error('Feil ved henting av integrasjonsleverandører etter type', { 
      error, 
      type: req.params.type,
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente integrasjonsleverandører'
    });
  }
});

// ==================== INTEGRATION CONFIGURATIONS ====================

/**
 * GET /api/integrations/configurations
 * Henter alle integrasjonskonfigurasjoner for brukerens bedrift
 */
router.get('/configurations', verifyToken, async (req: Request, res: Response) => {
  try {
    const configurations = await prisma.integrationConfiguration.findMany({
      where: { bedriftId: req.user!.bedriftId },
      include: {
        provider: true,
        opprettetAvAnsatt: {
          select: { fornavn: true, etternavn: true }
        }
      },
      orderBy: { opprettet: 'desc' }
    });

    // Fjern sensitive konfigurasjonsdata fra responsen
    const sanitizedConfigs = configurations.map(config => ({
      ...config,
      konfigurasjonsdata: { configured: Object.keys(config.konfigurasjonsdata as object).length > 0 }
    }));

    res.json({
      success: true,
      data: sanitizedConfigs,
      message: 'Integrasjonskonfigurasjoner hentet'
    });
  } catch (error) {
    logger.error('Feil ved henting av integrasjonskonfigurasjoner', { 
      error, 
      bedriftId: req.user?.bedriftId,
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente integrasjonskonfigurasjoner'
    });
  }
});

/**
 * POST /api/integrations/configurations
 * Oppretter ny integrasjonskonfigurasjon
 */
router.post('/configurations', 
  verifyToken, 
  validate(IntegrationConfigSchema),
  async (req: Request, res: Response) => {
    try {
      const { 
        providerId, 
        navn, 
        aktiv, 
        autoSync, 
        syncInterval,
        konfigurasjonsdata,
        syncKunder,
        syncFakturaer,
        syncProdukter,
        syncKontrakter,
        feltMapping,
        maxRetries,
        retryInterval,
        feilVarsling
      } = req.body;

      // Sjekk at provideren eksisterer
      const provider = await prisma.integrationProvider.findUnique({
        where: { id: providerId }
      });

      if (!provider || !provider.tilgjengelig) {
        return res.status(400).json({
          success: false,
          message: 'Ugyldig eller utilgjengelig integrasjonsleverandør'
        });
      }

      // Opprett konfigurasjon
      const configuration = await prisma.integrationConfiguration.create({
        data: {
          bedriftId: req.user!.bedriftId!,
          providerId,
          navn,
          aktiv,
          autoSync,
          syncInterval,
          konfigurasjonsdata, // I virkeligheten ville dette vært kryptert
          syncKunder,
          syncFakturaer,
          syncProdukter,
          syncKontrakter,
          feltMapping: feltMapping || {},
          maxRetries,
          retryInterval,
          feilVarsling,
          opprettetAv: req.user!.id
        },
        include: {
          provider: true
        }
      });

      // Log aktivitet
      await prisma.integrationLog.create({
        data: {
          bedriftId: req.user!.bedriftId!,
          providerId,
          konfigurasjonsId: configuration.id,
          operasjon: 'CREATE_CONFIG',
          status: 'SUCCESS',
          melding: `Opprettet integrasjonskonfigurasjon: ${navn}`,
          starttid: new Date(),
          sluttid: new Date()
        }
      });

      logger.info('Opprettet integrasjonskonfigurasjon', {
        configId: configuration.id,
        provider: provider.navn,
        userId: req.user!.id,
        bedriftId: req.user!.bedriftId
      });

      res.status(201).json({
        success: true,
        data: {
          ...configuration,
          konfigurasjonsdata: { configured: true }
        },
        message: 'Integrasjonskonfigurasjon opprettet'
      });
    } catch (error) {
      logger.error('Feil ved opprettelse av integrasjonskonfigurasjon', { 
        error, 
        userId: req.user?.id,
        bedriftId: req.user?.bedriftId
      });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke opprette integrasjonskonfigurasjon'
      });
    }
  }
);

/**
 * PUT /api/integrations/configurations/:id
 * Oppdaterer integrasjonskonfigurasjon
 */
router.put('/configurations/:id', 
  verifyToken,
  validate(IntegrationConfigSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const configId = parseInt(id);

      if (isNaN(configId)) {
        return res.status(400).json({
          success: false,
          message: 'Ugyldig konfigurasjon ID'
        });
      }

      // Sjekk at konfigurasjonen tilhører brukerens bedrift
      const existingConfig = await prisma.integrationConfiguration.findFirst({
        where: {
          id: configId,
          bedriftId: req.user!.bedriftId
        }
      });

      if (!existingConfig) {
        return res.status(404).json({
          success: false,
          message: 'Integrasjonskonfigurasjon ikke funnet'
        });
      }

      const updatedConfig = await prisma.integrationConfiguration.update({
        where: { id: configId },
        data: {
          ...req.body,
          oppdatert: new Date()
        },
        include: {
          provider: true
        }
      });

      // Log aktivitet
      await prisma.integrationLog.create({
        data: {
          bedriftId: req.user!.bedriftId!,
          providerId: updatedConfig.providerId,
          konfigurasjonsId: configId,
          operasjon: 'UPDATE_CONFIG',
          status: 'SUCCESS',
          melding: `Oppdatert integrasjonskonfigurasjon: ${updatedConfig.navn}`,
          starttid: new Date(),
          sluttid: new Date()
        }
      });

      logger.info('Oppdatert integrasjonskonfigurasjon', {
        configId,
        userId: req.user!.id,
        bedriftId: req.user!.bedriftId
      });

      res.json({
        success: true,
        data: {
          ...updatedConfig,
          konfigurasjonsdata: { configured: true }
        },
        message: 'Integrasjonskonfigurasjon oppdatert'
      });
    } catch (error) {
      logger.error('Feil ved oppdatering av integrasjonskonfigurasjon', { 
        error, 
        configId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke oppdatere integrasjonskonfigurasjon'
      });
    }
  }
);

/**
 * DELETE /api/integrations/configurations/:id
 * Sletter integrasjonskonfigurasjon
 */
router.delete('/configurations/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const configId = parseInt(id);

    if (isNaN(configId)) {
      return res.status(400).json({
        success: false,
        message: 'Ugyldig konfigurasjon ID'
      });
    }

    // Sjekk at konfigurasjonen tilhører brukerens bedrift
    const existingConfig = await prisma.integrationConfiguration.findFirst({
      where: {
        id: configId,
        bedriftId: req.user!.bedriftId
      },
      include: { provider: true }
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: 'Integrasjonskonfigurasjon ikke funnet'
      });
    }

    await prisma.integrationConfiguration.delete({
      where: { id: configId }
    });

    // Log aktivitet
    await prisma.integrationLog.create({
      data: {
        bedriftId: req.user!.bedriftId!,
        providerId: existingConfig.providerId,
        operasjon: 'DELETE_CONFIG',
        status: 'SUCCESS',
        melding: `Slettet integrasjonskonfigurasjon: ${existingConfig.navn}`,
        starttid: new Date(),
        sluttid: new Date()
      }
    });

    logger.info('Slettet integrasjonskonfigurasjon', {
      configId,
      provider: existingConfig.provider.navn,
      userId: req.user!.id,
      bedriftId: req.user!.bedriftId
    });

    res.json({
      success: true,
      message: 'Integrasjonskonfigurasjon slettet'
    });
  } catch (error) {
    logger.error('Feil ved sletting av integrasjonskonfigurasjon', { 
      error, 
      configId: req.params.id,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke slette integrasjonskonfigurasjon'
    });
  }
});

// ==================== SYNC JOBS ====================

/**
 * GET /api/integrations/sync-jobs/:configId
 * Henter sync jobs for en konfigurasjon
 */
router.get('/sync-jobs/:configId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    const parsedConfigId = parseInt(configId);

    if (isNaN(parsedConfigId)) {
      return res.status(400).json({
        success: false,
        message: 'Ugyldig konfigurasjon ID'
      });
    }

    // Verifiser at konfigurasjonen tilhører brukerens bedrift
    const config = await prisma.integrationConfiguration.findFirst({
      where: {
        id: parsedConfigId,
        bedriftId: req.user!.bedriftId
      }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Integrasjonskonfigurasjon ikke funnet'
      });
    }

    const syncJobs = await prisma.integrationSyncJob.findMany({
      where: { konfigurasjonsId: parsedConfigId },
      orderBy: { opprettet: 'desc' },
      take: 50 // Begrens antall resultater
    });

    res.json({
      success: true,
      data: syncJobs,
      message: 'Sync jobs hentet'
    });
  } catch (error) {
    logger.error('Feil ved henting av sync jobs', { 
      error, 
      configId: req.params.configId,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente sync jobs'
    });
  }
});

/**
 * POST /api/integrations/sync-jobs/:configId
 * Starter ny sync job
 */
router.post('/sync-jobs/:configId', 
  verifyToken,
  validate(SyncJobSchema),
  async (req: Request, res: Response) => {
    try {
      const { configId } = req.params;
      const parsedConfigId = parseInt(configId);
      const { type, prioritet, planlagtTid } = req.body;

      if (isNaN(parsedConfigId)) {
        return res.status(400).json({
          success: false,
          message: 'Ugyldig konfigurasjon ID'
        });
      }

      // Verifiser at konfigurasjonen tilhører brukerens bedrift og er aktiv
      const config = await prisma.integrationConfiguration.findFirst({
        where: {
          id: parsedConfigId,
          bedriftId: req.user!.bedriftId!,
          aktiv: true
        },
        include: { provider: true }
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'Aktiv integrasjonskonfigurasjon ikke funnet'
        });
      }

      const syncJob = await prisma.integrationSyncJob.create({
        data: {
          konfigurasjonsId: parsedConfigId,
          type,
          prioritet,
          planlagtTid: planlagtTid ? new Date(planlagtTid) : new Date()
        }
      });

      // Log aktivitet
      await prisma.integrationLog.create({
        data: {
          bedriftId: req.user!.bedriftId!,
          providerId: config.providerId,
          konfigurasjonsId: parsedConfigId,
          operasjon: 'START_SYNC',
          status: 'SUCCESS',
          melding: `Startet ${type} sync job`,
          starttid: new Date(),
          sluttid: new Date()
        }
      });

      logger.info('Startet sync job', {
        syncJobId: syncJob.id,
        configId: parsedConfigId,
        type,
        provider: config.provider.navn,
        userId: req.user!.id
      });

      res.status(201).json({
        success: true,
        data: syncJob,
        message: 'Sync job startet'
      });
    } catch (error) {
      logger.error('Feil ved start av sync job', { 
        error, 
        configId: req.params.configId,
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        message: 'Kunne ikke starte sync job'
      });
    }
  }
);

// ==================== INTEGRATION LOGS ====================

/**
 * GET /api/integrations/logs
 * Henter integrasjonslogger for brukerens bedrift
 */
router.get('/logs', verifyToken, async (req: Request, res: Response) => {
  try {
    const { providerId, status, limit = '50', offset = '0' } = req.query;
    
    const whereClause: any = {
      bedriftId: req.user!.bedriftId
    };

    if (providerId) {
      whereClause.providerId = parseInt(providerId as string);
    }

    if (status) {
      whereClause.status = status;
    }

    const logs = await prisma.integrationLog.findMany({
      where: whereClause,
      include: {
        provider: { select: { navn: true, type: true } },
        konfigurasjon: { select: { navn: true } }
      },
      orderBy: { opprettet: 'desc' },
      take: Math.min(parseInt(limit as string), 100),
      skip: parseInt(offset as string)
    });

    const totalCount = await prisma.integrationLog.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: totalCount > parseInt(offset as string) + parseInt(limit as string)
        }
      },
      message: 'Integrasjonslogger hentet'
    });
  } catch (error) {
    logger.error('Feil ved henting av integrasjonslogger', { 
      error, 
      userId: req.user?.id,
      bedriftId: req.user?.bedriftId
    });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke hente integrasjonslogger'
    });
  }
});

// ==================== TEST CONNECTION ====================

/**
 * POST /api/integrations/test-connection/:configId
 * Tester tilkobling til integrasjon
 */
router.post('/test-connection/:configId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { configId } = req.params;
    const parsedConfigId = parseInt(configId);

    if (isNaN(parsedConfigId)) {
      return res.status(400).json({
        success: false,
        message: 'Ugyldig konfigurasjon ID'
      });
    }

    const config = await prisma.integrationConfiguration.findFirst({
      where: {
        id: parsedConfigId,
        bedriftId: req.user!.bedriftId
      },
      include: { provider: true }
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Integrasjonskonfigurasjon ikke funnet'
      });
    }

    // Her ville vi normalt kalt på den faktiske integrasjonsservicen
    // For nå simulerer vi en tilkoblingstest
    const testResult = {
      success: true,
      message: `Tilkobling til ${config.provider.navn} vellykket`,
      timestamp: new Date(),
      responseTime: Math.floor(Math.random() * 1000) + 100 // Simulert responstid
    };

    // Log test
    await prisma.integrationLog.create({
      data: {
        bedriftId: req.user!.bedriftId!,
        providerId: config.providerId,
        konfigurasjonsId: parsedConfigId,
        operasjon: 'TEST_CONNECTION',
        status: testResult.success ? 'SUCCESS' : 'ERROR',
        melding: testResult.message,
        starttid: new Date(),
        sluttid: new Date(),
        varighet: testResult.responseTime
      }
    });

    res.json({
      success: true,
      data: testResult,
      message: 'Tilkoblingstest utført'
    });
  } catch (error) {
    logger.error('Feil ved tilkoblingstest', { 
      error, 
      configId: req.params.configId,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Kunne ikke teste tilkobling'
    });
  }
});

export default router; 
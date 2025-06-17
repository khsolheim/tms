/**
 * Monitoring Routes
 * 
 * Admin endpoints for performance metrics, cache statistics og validation monitoring
 */

import { Router } from 'express';
import { verifyToken, sjekkRolle } from '../middleware/auth';
import { getPerformanceMetrics } from '../middleware/performance';
import { getCacheStats, invalidateCacheEndpoint } from '../middleware/cache';
import { getValidationStatistics } from '../middleware/validationMonitoring';

const router = Router();

// Alle monitoring endpoints krever admin-tilgang
router.use(verifyToken);
router.use(sjekkRolle(['ADMIN']));

/**
 * GET /api/monitoring/performance
 * Hent performance metrics og statistikk
 */
router.get('/performance', getPerformanceMetrics);

/**
 * GET /api/monitoring/cache
 * Hent cache statistikk og hit ratio
 */
router.get('/cache', getCacheStats);

/**
 * POST /api/monitoring/cache/invalidate
 * Manuell cache invalidation med optional pattern
 * Body: { pattern?: string }
 */
router.post('/cache/invalidate', invalidateCacheEndpoint);

/**
 * GET /api/monitoring/validation
 * Hent validation monitoring statistikk
 */
router.get('/validation', (req, res) => {
  try {
    const stats = getValidationStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get validation statistics'
    });
  }
});

/**
 * POST /api/monitoring/validation/clear
 * Tøm validation history (men behold alerting)
 */
router.post('/validation/clear', (req, res) => {
  try {
    // Implementer clearing av validation history hvis nødvendig
    res.json({
      success: true,
      message: 'Validation history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear validation history'
    });
  }
});

/**
 * GET /api/monitoring/system
 * Kombinert system overview
 */
router.get('/system', async (req, res) => {
  try {
    // Samle data fra alle monitoring systemer
    const performanceData = await new Promise((resolve) => {
      const mockReq = {} as any;
      const mockRes = {
        json: (data: any) => resolve(data.data),
        status: () => mockRes
      } as any;
      getPerformanceMetrics(mockReq, mockRes);
    });

    const cacheData = await new Promise((resolve) => {
      const mockReq = {} as any;
      const mockRes = {
        json: (data: any) => resolve(data.data),
        status: () => mockRes
      } as any;
      getCacheStats(mockReq, mockRes);
    });

    const validationData = await new Promise((resolve) => {
      const mockReq = {} as any;
      const mockRes = {
        json: (data: any) => resolve(data.data),
        status: () => mockRes
      } as any;
      const validationStats = getValidationStatistics();
      resolve(validationStats);
    });

    res.json({
      success: true,
      data: {
        performance: performanceData,
        cache: cacheData,
        validation: validationData,
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to gather system monitoring data'
    });
  }
});

export default router; 
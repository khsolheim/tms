/**
 * Analytics API Routes
 * 
 * API endpoints for analytics og business intelligence
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics.service';
import { verifyToken, sjekkRolle, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createRateLimit } from '../middleware/rateLimiting';
import logger from '../utils/logger';

const router = Router();
const analyticsService = new AnalyticsService();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const EventSchema = z.object({
  eventName: z.string().min(1).max(100),
  properties: z.record(z.any()),
  sessionId: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  bedriftId: z.number().optional(),
  tenantId: z.number().optional()
});

const MetricsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str))
});

const UserAnalyticsQuerySchema = z.object({
  period: z.number().min(1).max(365).default(30)
});

const ExportQuerySchema = z.object({
  format: z.enum(['csv', 'excel', 'json']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  metrics: z.array(z.string()).min(1)
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Rate limiting for analytics endpoints
const analyticsRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutter
  maxRequests: 100, // 100 requests per 15 min
  message: 'For mange analytics forespørsler'
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/analytics/events
 * Spor analytics event
 */
router.post('/events',
  analyticsRateLimit,
  verifyToken,
  validate(z.object({ body: EventSchema })),
  async (req: AuthRequest, res: Response) => {
    try {
      const eventData = {
        ...req.body,
        userId: req.bruker?.id,
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        tenantId: req.bruker?.bedriftId
      };

      await analyticsService.sporEvent(eventData);

      res.status(201).json({
        success: true,
        message: 'Event sporet'
      });
    } catch (error) {
      logger.error('Feil ved sporing av event', error);
      res.status(500).json({
        success: false,
        message: 'Feil ved sporing av event'
      });
    }
  }
);

/**
 * GET /api/analytics/users/:userId
 * Hent brukeranalyse
 */
router.get('/users/:userId',
  analyticsRateLimit,
  verifyToken,
  sjekkRolle(['ADMIN', 'SJEF']),
  validate(z.object({ query: UserAnalyticsQuerySchema })),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const period = req.query.period ? parseInt(req.query.period as string) : 30;

      const analytics = await analyticsService.hentBrukerAnalyse(userId, period);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Feil ved henting av brukeranalyse', error);
      res.status(500).json({
        success: false,
        message: 'Feil ved henting av brukeranalyse'
      });
    }
  }
);

/**
 * GET /api/analytics/metrics
 * Hent business metrics
 */
router.get('/metrics',
  analyticsRateLimit,
  verifyToken,
  sjekkRolle(['ADMIN', 'SJEF']),
  validate(z.object({ query: MetricsQuerySchema })),
  async (req: AuthRequest, res: Response) => {
    try {
      const period = req.query.period as 'day' | 'week' | 'month' | 'quarter' | 'year';
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const metrics = await analyticsService.hentBusinessMetrics(period, startDate, endDate);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Feil ved henting av business metrics', error);
      res.status(500).json({
        success: false,
        message: 'Feil ved henting av business metrics'
      });
    }
  }
);

/**
 * GET /api/analytics/dashboard
 * Hent dashboard data
 */
router.get('/dashboard',
  analyticsRateLimit,
  verifyToken,
  sjekkRolle(['ADMIN', 'SJEF']),
  async (req: AuthRequest, res: Response) => {
    try {
      const dashboardData = await analyticsService.hentDashboardData();

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      logger.error('Feil ved henting av dashboard data', error);
      res.status(500).json({
        success: false,
        message: 'Feil ved henting av dashboard data'
      });
    }
  }
);

/**
 * GET /api/analytics/predictions
 * Hent prediktiv analyse
 */
router.get('/predictions',
  analyticsRateLimit,
  verifyToken,
  sjekkRolle(['ADMIN', 'SJEF']),
  async (req: AuthRequest, res: Response) => {
    try {
      const predictions = await analyticsService.genererPrediktivAnalyse();

      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      logger.error('Feil ved generering av prediktiv analyse', error);
      res.status(500).json({
        success: false,
        message: 'Feil ved generering av prediktiv analyse'
      });
    }
  }
);

/**
 * GET /api/analytics/export
 * Eksporter analytics data
 */
router.get('/export',
  analyticsRateLimit,
  verifyToken,
  sjekkRolle(['ADMIN', 'SJEF']),
  validate(z.object({ query: ExportQuerySchema })),
  async (req: AuthRequest, res: Response) => {
    try {
      const format = req.query.format as 'csv' | 'excel' | 'json';
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const metrics = req.query.metrics as string[];

      const exportData = await analyticsService.eksporterAnalyticsData(
        format, 
        startDate, 
        endDate, 
        metrics
      );

      // Set appropriate headers based on format
      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
          break;
        case 'excel':
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.xlsx');
          break;
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.json');
          break;
      }

      if (format === 'json') {
        res.json({
          success: true,
          data: exportData
        });
      } else {
        res.send(exportData);
      }
    } catch (error) {
      logger.error('Feil ved eksport av analytics data', error);
      res.status(500).json({
        success: false,
        message: 'Feil ved eksport av analytics data'
      });
    }
  }
);

/**
 * GET /api/analytics/health
 * Health check for analytics service
 */
router.get('/health',
  analyticsRateLimit,
  async (req: Request, res: Response) => {
    try {
      // Simple health check
      const status = {
        service: 'analytics',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Analytics service health check feilet', error);
      res.status(503).json({
        success: false,
        message: 'Service utilgjengelig'
      });
    }
  }
);

export default router; 
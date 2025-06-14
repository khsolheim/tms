/**
 * Real User Monitoring (RUM) Routes
 * 
 * Endpoints for å samle inn frontend performance data fra brukers enheter
 */

import { Router } from 'express';
import logger from '../utils/logger';
import cacheService from '../services/cache.service';

const router = Router();

/**
 * POST /api/rum/metrics
 * Motta RUM metrics fra frontend
 */
router.post('/metrics', async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      metrics,
      interactions,
      errors,
      isFinal,
      timestamp
    } = req.body;

    // Validering
    if (!sessionId || !metrics) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, metrics'
      });
    }

    // Lagre RUM data i cache
    const rumKey = `rum:session:${sessionId}`;
    const existingData = await cacheService.get(rumKey) || {
      sessionId,
      userId,
      startTime: timestamp,
      metrics: [],
      interactions: [],
      errors: [],
      lastUpdate: timestamp
    };

    // Oppdater data
    existingData.metrics = metrics;
    existingData.interactions = (existingData.interactions || []).concat(interactions || []);
    existingData.errors = (existingData.errors || []).concat(errors || []);
    existingData.lastUpdate = timestamp;
    
    if (isFinal) {
      existingData.endTime = timestamp;
    }

    // Cache data (TTL 24 timer)
    await cacheService.set(rumKey, existingData, 86400);

    // Aggreger metrics for dashboard
    await aggregateRUMMetrics(existingData);

    // Log performance issues
    if (metrics.length > 0) {
      const latestMetrics = metrics[metrics.length - 1];
      logPerformanceIssues(latestMetrics, sessionId);
    }

    // Log errors
    if (errors && errors.length > 0) {
      errors.forEach((error: any) => {
        logger.error('RUM Frontend Error', {
          sessionId,
          userId,
          error: error.message,
          stack: error.stack,
          url: error.url,
          timestamp: error.timestamp
        });
      });
    }

    res.json({
      success: true,
      message: 'RUM metrics recorded'
    });

  } catch (error) {
    logger.error('Error processing RUM metrics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process RUM metrics'
    });
  }
});

/**
 * GET /api/rum/dashboard
 * Hent aggregerte RUM data for dashboard (admin only)
 */
router.get('/dashboard', async (req, res) => {
  try {
    const dashboardData = await getRUMDashboardData();
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error getting RUM dashboard data', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RUM dashboard data'
    });
  }
});

/**
 * GET /api/rum/sessions
 * Hent aktive/nylige RUM sesjoner
 */
router.get('/sessions', async (req, res) => {
  try {
    const { limit = 50, status = 'all' } = req.query;
    
    // Hent session data fra cache
    const sessions = await getRUMSessions(Number(limit), status as string);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    logger.error('Error getting RUM sessions', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RUM sessions'
    });
  }
});

/**
 * Aggreger RUM metrics for dashboard statistikk
 */
async function aggregateRUMMetrics(sessionData: any): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const aggregateKey = `rum:aggregate:${today}`;
    
    const existing = await cacheService.get(aggregateKey) || {
      date: today,
      totalSessions: 0,
      totalPageviews: 0,
      averageMetrics: {
        FCP: 0,
        LCP: 0,
        FID: 0,
        CLS: 0,
        TTFB: 0,
        domLoadTime: 0,
        windowLoadTime: 0
      },
      deviceStats: {},
      connectionStats: {},
      errorRate: 0,
      bounceRate: 0
    };

    existing.totalSessions++;
    
    if (sessionData.metrics && sessionData.metrics.length > 0) {
      const latestMetrics = sessionData.metrics[sessionData.metrics.length - 1];
      
      // Oppdater gjennomsnitt (enkelt moving average)
      const updateAverage = (current: number, newValue: number, count: number) => {
        return ((current * (count - 1)) + newValue) / count;
      };

      if (latestMetrics.FCP) {
        existing.averageMetrics.FCP = updateAverage(
          existing.averageMetrics.FCP, 
          latestMetrics.FCP, 
          existing.totalSessions
        );
      }
      
      if (latestMetrics.LCP) {
        existing.averageMetrics.LCP = updateAverage(
          existing.averageMetrics.LCP, 
          latestMetrics.LCP, 
          existing.totalSessions
        );
      }

      // Device stats
      if (latestMetrics.connectionType) {
        existing.connectionStats[latestMetrics.connectionType] = 
          (existing.connectionStats[latestMetrics.connectionType] || 0) + 1;
      }
    }

    // Error rate
    if (sessionData.errors && sessionData.errors.length > 0) {
      existing.errorRate = ((existing.errorRate * (existing.totalSessions - 1)) + 1) / existing.totalSessions;
    }

    await cacheService.set(aggregateKey, existing, 86400);
  } catch (error) {
    logger.error('Failed to aggregate RUM metrics', error);
  }
}

/**
 * Log performance issues basert på thresholds
 */
function logPerformanceIssues(metrics: any, sessionId: string): void {
  const issues: string[] = [];

  // Core Web Vitals thresholds
  if (metrics.FCP > 1800) issues.push('Poor FCP');
  if (metrics.LCP > 2500) issues.push('Poor LCP');
  if (metrics.FID > 100) issues.push('Poor FID');
  if (metrics.CLS > 0.1) issues.push('Poor CLS');
  
  // Loading performance
  if (metrics.TTFB > 800) issues.push('Slow TTFB');
  if (metrics.domLoadTime > 5000) issues.push('Slow DOM Load');
  if (metrics.windowLoadTime > 10000) issues.push('Slow Window Load');

  if (issues.length > 0) {
    logger.warn('RUM Performance Issues Detected', {
      sessionId,
      issues,
      metrics: {
        FCP: metrics.FCP,
        LCP: metrics.LCP,
        FID: metrics.FID,
        CLS: metrics.CLS,
        TTFB: metrics.TTFB,
        domLoadTime: metrics.domLoadTime,
        windowLoadTime: metrics.windowLoadTime
      }
    });
  }
}

/**
 * Hent RUM dashboard data
 */
async function getRUMDashboardData(): Promise<any> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [todayData, yesterdayData] = await Promise.all([
      cacheService.get(`rum:aggregate:${today}`),
      cacheService.get(`rum:aggregate:${yesterday}`)
    ]);

    return {
      today: todayData || {},
      yesterday: yesterdayData || {},
      trends: {
        sessionsChange: calculatePercentageChange(
          todayData?.totalSessions || 0,
          yesterdayData?.totalSessions || 0
        ),
        performanceChange: calculatePercentageChange(
          todayData?.averageMetrics?.LCP || 0,
          yesterdayData?.averageMetrics?.LCP || 0
        )
      },
      realtime: {
        activeSessions: await getActiveSessionsCount(),
        currentLoad: await getCurrentServerLoad()
      }
    };
  } catch (error) {
    logger.error('Failed to get RUM dashboard data', error);
    return {};
  }
}

/**
 * Hent RUM sesjoner
 */
async function getRUMSessions(limit: number, status: string): Promise<any[]> {
  try {
    // Dette er en forenklet implementering - i produksjon ville vi brukt database
    const sessions: any[] = [];
    
    // For nå returnerer vi mock data
    return sessions.slice(0, limit);
  } catch (error) {
    logger.error('Failed to get RUM sessions', error);
    return [];
  }
}

/**
 * Beregn prosentvis endring
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Hent antall aktive sesjoner
 */
async function getActiveSessionsCount(): Promise<number> {
  try {
    // Implementer logikk for å telle aktive sesjoner
    return 0; // Placeholder
  } catch {
    return 0;
  }
}

/**
 * Hent current server load
 */
async function getCurrentServerLoad(): Promise<any> {
  try {
    const memoryUsage = process.memoryUsage();
    return {
      memory: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      uptime: process.uptime()
    };
  } catch {
    return { memory: 0, uptime: 0 };
  }
}

export default router; 
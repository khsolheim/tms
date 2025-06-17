/**
 * Cache Middleware
 * 
 * Express middleware for intelligent API response caching
 * med Redis backend
 */

import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import logger from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request, res: Response) => boolean;
  tags?: string[];
}

// ============================================================================
// CACHE MIDDLEWARE
// ============================================================================

/**
 * API Response Cache Middleware
 */
export function apiCache(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    skip = defaultSkipFunction,
    tags = [],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for certain conditions
    if (skip(req, res)) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      
      // Try to get cached response
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for: ${cacheKey}`);
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cached.data);
      }

      // Cache miss - proceed with request
      logger.debug(`Cache miss for: ${cacheKey}`);
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);

      // Intercept response
      const originalJson = res.json;
      res.json = function(data: any) {
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            data,
            timestamp: Date.now(),
            statusCode: res.statusCode,
          };

          if (tags.length > 0) {
            cacheService.setWithTags(cacheKey, cacheData, tags, ttl)
              .catch(error => logger.error('Cache set error:', error));
          } else {
            cacheService.set(cacheKey, cacheData, ttl)
              .catch(error => logger.error('Cache set error:', error));
          }
        }

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next(); // Continue without caching on error
    }
  };
}

/**
 * Invalidate cache by tags middleware
 */
export function invalidateCache(tags: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute the route handler first
    const originalJson = res.json;
    res.json = function(data: any) {
      // Invalidate cache after successful operation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.invalidateByTags(tags)
          .catch(error => logger.error('Cache invalidation error:', error));
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

// ============================================================================
// PREDEFINED CACHE CONFIGURATIONS
// ============================================================================

/**
 * Short cache for frequently changing data
 */
export const shortCache = apiCache({
  ttl: 60, // 1 minute
  tags: ['short-term'],
});

/**
 * Medium cache for moderately changing data
 */
export const mediumCache = apiCache({
  ttl: 300, // 5 minutes
  tags: ['medium-term'],
});

/**
 * Long cache for rarely changing data
 */
export const longCache = apiCache({
  ttl: 3600, // 1 hour
  tags: ['long-term'],
});

/**
 * Kontrakter specific cache
 */
export const kontraktCache = apiCache({
  ttl: 300, // 5 minutes
  tags: ['kontrakter'],
  keyGenerator: (req) => {
    const { status, bedriftId, search, page, limit } = req.query;
    return `kontrakter:${status || 'all'}:${bedriftId || 'all'}:${search || 'all'}:${page || 1}:${limit || 50}`;
  },
});

/**
 * Bedrifter specific cache
 */
export const bedriftCache = apiCache({
  ttl: 600, // 10 minutes
  tags: ['bedrifter'],
  keyGenerator: (req) => {
    const { search, page, limit } = req.query;
    return `bedrifter:${search || 'all'}:${page || 1}:${limit || 50}`;
  },
});

/**
 * Elever specific cache
 */
export const elevCache = apiCache({
  ttl: 300, // 5 minutes
  tags: ['elever'],
  keyGenerator: (req) => {
    const { search, klasseId, page, limit } = req.query;
    return `elever:${search || 'all'}:${klasseId || 'all'}:${page || 1}:${limit || 50}`;
  },
});

/**
 * Dashboard stats cache
 */
export const dashboardCache = apiCache({
  ttl: 120, // 2 minutes
  tags: ['dashboard', 'stats'],
  keyGenerator: () => 'dashboard:stats',
});

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate kontrakter related caches
 */
export const invalidateKontraktCaches = invalidateCache([
  'kontrakter',
  'dashboard',
  'stats',
]);

/**
 * Invalidate bedrifter related caches
 */
export const invalidateBedriftCaches = invalidateCache([
  'bedrifter',
  'dashboard',
  'stats',
]);

/**
 * Invalidate elever related caches
 */
export const invalidateElevCaches = invalidateCache([
  'elever',
  'dashboard',
  'stats',
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Default cache key generator
 */
function defaultKeyGenerator(req: Request): string {
  const baseUrl = req.baseUrl || '';
  const url = req.url;
  const query = JSON.stringify(req.query);
  const userId = (req as any).user?.id || 'anonymous';
  
  return `api:${baseUrl}${url}:${Buffer.from(query).toString('base64')}:${userId}`;
}

/**
 * Default skip function - skip caching for certain conditions
 */
function defaultSkipFunction(req: Request, res: Response): boolean {
  // Skip if no-cache header is present
  if (req.headers['cache-control']?.includes('no-cache')) {
    return true;
  }

  // Skip if Authorization header is present (user-specific data)
  if (req.headers.authorization && !req.url.includes('/public/')) {
    // Allow caching for some user-specific endpoints
    const allowedUserEndpoints = ['/api/dashboard/stats', '/api/profile'];
    return !allowedUserEndpoints.some(endpoint => req.url.startsWith(endpoint));
  }

  // Skip for error responses
  if (res.statusCode >= 400) {
    return true;
  }

  return false;
}

/**
 * Manual cache warming
 */
export async function warmCache(routes: { path: string; key: string; fetcher: () => Promise<any> }[]): Promise<void> {
  logger.info('Starting cache warming...');
  
  const promises = routes.map(async ({ path, key, fetcher }) => {
    try {
      const data = await fetcher();
      await cacheService.set(key, data, 3600); // 1 hour
      logger.debug(`Cache warmed for: ${path}`);
    } catch (error) {
      logger.error(`Cache warming failed for ${path}:`, error);
    }
  });

  await Promise.allSettled(promises);
  logger.info('Cache warming completed');
}

/**
 * Cache health check middleware
 */
export function cacheHealthCheck() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await cacheService.getStats();
      res.json({
        status: 'healthy',
        redis: {
          connected: true,
          memory: stats.memory,
          hits: stats.hits,
          misses: stats.misses,
          hitRatio: stats.hits / (stats.hits + stats.misses) * 100,
          keys: stats.keys,
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        redis: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  apiCache,
  invalidateCache,
  shortCache,
  mediumCache,
  longCache,
  kontraktCache,
  bedriftCache,
  elevCache,
  dashboardCache,
  invalidateKontraktCaches,
  invalidateBedriftCaches,
  invalidateElevCaches,
  warmCache,
  cacheHealthCheck,
}; 
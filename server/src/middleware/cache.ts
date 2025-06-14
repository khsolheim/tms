/**
 * Cache Middleware for API Responses
 * 
 * Implementerer intelligent caching av GET requests med
 * configurable TTL, cache invalidation og memory management
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Cache entry interface
interface CacheEntry {
  data: any;
  headers: Record<string, string>;
  statusCode: number;
  timestamp: Date;
  ttl: number; // Time to live in seconds
  hits: number;
  lastAccessed: Date;
}

// Cache configuration interface
interface CacheConfig {
  ttl: number; // Default TTL in seconds
  maxSize: number; // Maximum number of entries
  excludePatterns: RegExp[]; // URL patterns to exclude from caching
  includePatterns?: RegExp[]; // Optional: only cache these patterns
  keyGenerator?: (req: Request) => string; // Custom cache key generator
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.config = config;
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const isExpired = (now.getTime() - entry.timestamp.getTime()) / 1000 > entry.ttl;
      if (isExpired) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    // If cache is still too large, remove oldest entries
    if (this.cache.size > this.config.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());

      const toRemove = this.cache.size - this.config.maxSize;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }

    logger.debug('Cache cleanup completed', {
      entriesRemoved: keysToDelete.length,
      currentSize: this.cache.size,
      maxSize: this.config.maxSize
    });
  }

  private shouldCache(req: Request): boolean {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return false;
    }

    const url = req.originalUrl || req.url;

    // Check exclude patterns
    for (const pattern of this.config.excludePatterns) {
      if (pattern.test(url)) {
        return false;
      }
    }

    // Check include patterns if specified
    if (this.config.includePatterns && this.config.includePatterns.length > 0) {
      for (const pattern of this.config.includePatterns) {
        if (pattern.test(url)) {
          return true;
        }
      }
      return false;
    }

    return true;
  }

  private generateKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key generation
    const url = req.originalUrl || req.url;
    const userId = (req as any).user?.id || 'anonymous';
    return `${req.method}:${url}:user:${userId}`;
  }

  get(req: Request): CacheEntry | null {
    if (!this.shouldCache(req)) {
      return null;
    }

    const key = this.generateKey(req);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = new Date();
    const isExpired = (now.getTime() - entry.timestamp.getTime()) / 1000 > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.hits++;
    entry.lastAccessed = now;

    return entry;
  }

  set(req: Request, data: any, headers: Record<string, string>, statusCode: number, customTtl?: number): void {
    if (!this.shouldCache(req)) {
      return;
    }

    const key = this.generateKey(req);
    const ttl = customTtl || this.config.ttl;

    const entry: CacheEntry = {
      data,
      headers,
      statusCode,
      timestamp: new Date(),
      ttl,
      hits: 0,
      lastAccessed: new Date()
    };

    this.cache.set(key, entry);

    // Immediate cleanup if over size limit
    if (this.cache.size > this.config.maxSize) {
      this.cleanup();
    }
  }

  invalidate(pattern?: RegExp | string): number {
    let removedCount = 0;

    if (!pattern) {
      // Clear all cache
      removedCount = this.cache.size;
      this.cache.clear();
    } else if (pattern instanceof RegExp) {
      // Remove entries matching regex pattern
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => {
        this.cache.delete(key);
        removedCount++;
      });
    } else {
      // Remove specific key
      if (this.cache.delete(pattern)) {
        removedCount = 1;
      }
    }

    logger.info('Cache invalidated', {
      pattern: pattern?.toString(),
      removedCount,
      remainingSize: this.cache.size
    });

    return removedCount;
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRatio: number;
    topHits: Array<{ key: string; hits: number; lastAccessed: Date }>;
  } {
    let totalHits = 0;
    let totalEntries = 0;

    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      totalHits += entry.hits;
      totalEntries++;
      return { key, hits: entry.hits, lastAccessed: entry.lastAccessed };
    });

    const hitRatio = totalEntries > 0 ? totalHits / totalEntries : 0;
    const topHits = entries
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRatio,
      topHits
    };
  }
}

// Default cache configuration
const defaultConfig: CacheConfig = {
  ttl: 300, // 5 minutes
  maxSize: 1000,
  excludePatterns: [
    /\/api\/auth\//,      // Authentication endpoints
    /\/api\/admin\//,     // Admin endpoints
    /\/api\/upload\//,    // File upload endpoints
    /\/api\/performance/, // Performance metrics
    /\/api\/logs/         // Log endpoints
  ]
};

// Create cache instance
const memoryCache = new MemoryCache(defaultConfig);

/**
 * Cache middleware for GET requests
 * Caches responses based on URL and user context
 */
export const cacheMiddleware = (customConfig?: Partial<CacheConfig>) => {
  const config = { ...defaultConfig, ...customConfig };
  const cache = customConfig ? new MemoryCache(config) : memoryCache;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Try to get from cache
    const cachedEntry = cache.get(req);

    if (cachedEntry) {
      // Set cached headers
      Object.entries(cachedEntry.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Add cache hit header
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Timestamp', cachedEntry.timestamp.toISOString());

      logger.debug('Cache hit', {
        url: req.originalUrl || req.url,
        method: req.method,
        hits: cachedEntry.hits
      });

      res.status(cachedEntry.statusCode).json(cachedEntry.data);
      return;
    }

    // Cache miss - intercept response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const headers: Record<string, string> = {};
        
        // Copy relevant headers
        ['content-type', 'etag', 'last-modified'].forEach(headerName => {
          const value = res.getHeader(headerName);
          if (value) {
            headers[headerName] = value.toString();
          }
        });

        cache.set(req, data, headers, res.statusCode);

        logger.debug('Response cached', {
          url: req.originalUrl || req.url,
          method: req.method,
          statusCode: res.statusCode
        });
      }

      // Add cache miss header
      res.setHeader('X-Cache', 'MISS');

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache entries for specific patterns
 */
export const invalidateCache = (pattern?: RegExp | string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Invalidate after successful mutations
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          memoryCache.invalidate(pattern);
        }
      }
    });

    next();
  };
};

/**
 * Get cache statistics (admin only)
 */
export const getCacheStats = (req: Request, res: Response) => {
  try {
    const stats = memoryCache.getStats();

    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date(),
        config: {
          ttl: defaultConfig.ttl,
          maxSize: defaultConfig.maxSize,
          excludePatterns: defaultConfig.excludePatterns.map(p => p.toString())
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get cache statistics', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache statistics'
    });
  }
};

/**
 * Manual cache invalidation endpoint (admin only)
 */
export const invalidateCacheEndpoint = (req: Request, res: Response) => {
  try {
    const { pattern } = req.body;
    let regex: RegExp | undefined;

    if (pattern) {
      try {
        regex = new RegExp(pattern);
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: 'Invalid regex pattern'
        });
      }
    }

    const removedCount = memoryCache.invalidate(regex);

    res.json({
      success: true,
      data: {
        removedCount,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Failed to invalidate cache', error);
    res.status(500).json({
      success: false,
      error: 'Failed to invalidate cache'
    });
  }
};

export { memoryCache }; 
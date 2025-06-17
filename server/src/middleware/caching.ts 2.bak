/**
 * Advanced Caching Middleware
 * 
 * Komplett caching system med:
 * - Multi-layer caching (Memory + Redis)
 * - Intelligent cache invalidation
 * - Query result caching
 * - Response compression
 * - Cache warming strategies
 * - Performance metrics
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { promisify } from 'util';
import zlib from 'zlib';
import logger from '../utils/logger';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number; // Max cache size in MB
  compression?: boolean;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  varyBy?: string[]; // Headers to vary cache by
  staleWhileRevalidate?: number; // Serve stale for X seconds while revalidating
  tags?: string[]; // Cache tags for group invalidation
}

interface CacheEntry {
  data: any;
  headers: Record<string, string>;
  statusCode: number;
  timestamp: number;
  ttl: number;
  compressed: boolean;
  tags: string[];
  accessCount: number;
  lastAccess: number;
  size: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalSize: number;
  averageResponseTime: number;
  hitRate: number;
  lastReset: number;
}

interface QueryCacheEntry {
  result: any;
  timestamp: number;
  ttl: number;
  query: string;
  params: any[];
  tags: string[];
}

// ============================================================================
// COMPRESSION UTILITIES
// ============================================================================

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

class CompressionManager {
  static async compress(data: string): Promise<Buffer> {
    return await gzip(data);
  }

  static async decompress(data: Buffer): Promise<string> {
    const decompressed = await gunzip(data);
    return decompressed.toString();
  }

  static shouldCompress(data: string, minSize: number = 1024): boolean {
    return data.length >= minSize;
  }

  static getCompressionRatio(original: number, compressed: number): number {
    return Math.round((1 - compressed / original) * 100);
  }
}

// ============================================================================
// MEMORY CACHE MANAGER
// ============================================================================

class MemoryCacheManager {
  private cache = new Map<string, CacheEntry>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalSize: 0,
    averageResponseTime: 0,
    hitRate: 0,
    lastReset: Date.now()
  };
  private maxSizeBytes: number;
  private responseTimes: number[] = [];

  constructor(maxSizeMB: number = 100) {
    this.maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
    
    // Reset metrics every hour
    setInterval(() => this.resetMetrics(), 60 * 60 * 1000);
  }

  async get(key: string): Promise<CacheEntry | null> {
    const startTime = Date.now();
    
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.metrics.misses++;
        return null;
      }

      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
        this.metrics.misses++;
        this.metrics.evictions++;
        this.updateTotalSize();
        return null;
      }

      // Update access statistics
      entry.accessCount++;
      entry.lastAccess = Date.now();
      
      this.metrics.hits++;
      this.updateResponseTime(Date.now() - startTime);
      
      return entry;
    } catch (error) {
      logger.error('Memory cache get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.metrics.misses++;
      return null;
    }
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    try {
      // Check size limits before adding
      if (this.metrics.totalSize + entry.size > this.maxSizeBytes) {
        await this.evictLRU(entry.size);
      }

      this.cache.set(key, entry);
      this.metrics.sets++;
      this.updateTotalSize();
      
      logger.debug('Memory cache set', {
        key,
        size: entry.size,
        ttl: entry.ttl,
        compressed: entry.compressed,
        tags: entry.tags
      });
    } catch (error) {
      logger.error('Memory cache set error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(key: string): Promise<void> {
    if (this.cache.delete(key)) {
      this.metrics.deletes++;
      this.updateTotalSize();
    }
  }

  async deleteByTags(tags: string[]): Promise<number> {
    let deleted = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.metrics.deletes += deleted;
    this.updateTotalSize();
    
    return deleted;
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.metrics.deletes += size;
    this.updateTotalSize();
  }

  getMetrics(): CacheMetrics {
    this.updateHitRate();
    return { ...this.metrics };
  }

  getStats(): {
    entries: number;
    sizeMB: number;
    maxSizeMB: number;
    utilizationPercent: number;
    topKeys: Array<{ key: string; accessCount: number; size: number }>;
  } {
    const entries = Array.from(this.cache.entries());
    const topKeys = entries
      .map(([key, entry]) => ({
        key: key.substring(0, 50) + (key.length > 50 ? '...' : ''),
        accessCount: entry.accessCount,
        size: entry.size
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    return {
      entries: this.cache.size,
      sizeMB: Math.round(this.metrics.totalSize / 1024 / 1024 * 100) / 100,
      maxSizeMB: Math.round(this.maxSizeBytes / 1024 / 1024),
      utilizationPercent: Math.round((this.metrics.totalSize / this.maxSizeBytes) * 100),
      topKeys
    };
  }

  private async evictLRU(neededSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last access time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccess - b.lastAccess);
    
    let freedSize = 0;
    let evicted = 0;
    
    for (const [key, entry] of entries) {
      this.cache.delete(key);
      freedSize += entry.size;
      evicted++;
      
      if (freedSize >= neededSize) break;
    }
    
    this.metrics.evictions += evicted;
    this.updateTotalSize();
    
    logger.info('Memory cache LRU eviction', {
      evicted,
      freedSizeMB: Math.round(freedSize / 1024 / 1024 * 100) / 100,
      neededSizeMB: Math.round(neededSize / 1024 / 1024 * 100) / 100
    });
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.metrics.evictions += cleaned;
      this.updateTotalSize();
      
      logger.debug('Memory cache cleanup', {
        cleaned,
        remaining: this.cache.size
      });
    }
  }

  private updateTotalSize(): void {
    this.metrics.totalSize = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private updateResponseTime(time: number): void {
    this.responseTimes.push(time);
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
    
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalSize: this.metrics.totalSize,
      averageResponseTime: 0,
      hitRate: 0,
      lastReset: Date.now()
    };
    this.responseTimes = [];
  }
}

// ============================================================================
// REDIS CACHE MANAGER
// ============================================================================

class RedisCacheManager {
  private client: any = null;
  private isConnected = false;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalSize: 0,
    averageResponseTime: 0,
    hitRate: 0,
    lastReset: Date.now()
  };

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Only initialize if Redis URL is provided
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        logger.info('Redis URL not provided, using memory cache only');
        return;
      }

      // Dynamic import of Redis (optional dependency)
      const { createClient } = await import('redis');
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000
        }
      });

      this.client.on('error', (error: Error) => {
        logger.error('Redis connection error', {
          error: error.message
        });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis cache connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Redis not available, using memory cache only', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.isConnected) return null;

    const startTime = Date.now();
    
    try {
      const data = await this.client.get(key);
      
      if (!data) {
        this.metrics.misses++;
        return null;
      }

      const entry: CacheEntry = JSON.parse(data);
      
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl * 1000) {
        await this.client.del(key);
        this.metrics.misses++;
        this.metrics.evictions++;
        return null;
      }

      this.metrics.hits++;
      this.updateResponseTime(Date.now() - startTime);
      
      return entry;
    } catch (error) {
      logger.error('Redis cache get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.metrics.misses++;
      return null;
    }
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    if (!this.isConnected) return;

    try {
      const data = JSON.stringify(entry);
      await this.client.setEx(key, entry.ttl, data);
      
      this.metrics.sets++;
      
      logger.debug('Redis cache set', {
        key,
        ttl: entry.ttl,
        size: entry.size
      });
    } catch (error) {
      logger.error('Redis cache set error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
      this.metrics.deletes++;
    } catch (error) {
      logger.error('Redis cache delete error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteByTags(tags: string[]): Promise<number> {
    if (!this.isConnected) return 0;

    try {
      // This is a simplified implementation
      // In production, you'd use Redis Sets to track keys by tags
      const keys = await this.client.keys('*');
      let deleted = 0;

      for (const key of keys) {
        const data = await this.client.get(key);
        if (data) {
          const entry: CacheEntry = JSON.parse(data);
          if (tags.some(tag => entry.tags.includes(tag))) {
            await this.client.del(key);
            deleted++;
          }
        }
      }

      this.metrics.deletes += deleted;
      return deleted;
    } catch (error) {
      logger.error('Redis cache delete by tags error', {
        tags,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.flushDb();
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error('Redis cache clear error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  getMetrics(): CacheMetrics {
    this.updateHitRate();
    return { ...this.metrics };
  }

  private updateResponseTime(time: number): void {
    // Simple moving average
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * 0.9) + (time * 0.1);
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }
}

// ============================================================================
// CACHE KEY GENERATOR
// ============================================================================

class CacheKeyGenerator {
  static generateKey(req: Request, varyBy: string[] = []): string {
    const baseKey = `${req.method}:${req.originalUrl}`;
    
    // Add vary headers
    const varyData = varyBy.map(header => 
      `${header}:${req.get(header) || 'none'}`
    ).join('|');
    
    // Add user context if available
    const userContext = (req as any).bruker?.id ? `user:${(req as any).bruker.id}` : 'anonymous';
    
    const fullKey = `${baseKey}|${varyData}|${userContext}`;
    
    // Hash long keys
    if (fullKey.length > 200) {
      return createHash('sha256').update(fullKey).digest('hex');
    }
    
    return fullKey;
  }

  static generateQueryKey(query: string, params: any[]): string {
    const paramString = JSON.stringify(params);
    const fullKey = `query:${query}:${paramString}`;
    
    return createHash('sha256').update(fullKey).digest('hex');
  }

  static generateTagKey(tag: string): string {
    return `tag:${tag}`;
  }
}

// ============================================================================
// MAIN CACHE MANAGER
// ============================================================================

class CacheManager {
  private memoryCache: MemoryCacheManager;
  private redisCache: RedisCacheManager;
  private queryCache = new Map<string, QueryCacheEntry>();

  constructor(maxMemorySizeMB: number = 100) {
    this.memoryCache = new MemoryCacheManager(maxMemorySizeMB);
    this.redisCache = new RedisCacheManager();
  }

  async get(key: string): Promise<CacheEntry | null> {
    // Try memory cache first (fastest)
    let entry = await this.memoryCache.get(key);
    
    if (entry) {
      logger.debug('Cache hit (memory)', { key });
      return entry;
    }

    // Try Redis cache
    entry = await this.redisCache.get(key);
    
    if (entry) {
      logger.debug('Cache hit (redis)', { key });
      
      // Populate memory cache for faster future access
      await this.memoryCache.set(key, entry);
      return entry;
    }

    logger.debug('Cache miss', { key });
    return null;
  }

  async set(key: string, data: any, headers: Record<string, string>, statusCode: number, config: CacheConfig): Promise<void> {
    const timestamp = Date.now();
    const dataString = JSON.stringify(data);
    
    let compressed = false;
    let finalData = dataString;
    
    // Compress if enabled and data is large enough
    if (config.compression && CompressionManager.shouldCompress(dataString)) {
      try {
        const compressedBuffer = await CompressionManager.compress(dataString);
        finalData = compressedBuffer.toString('base64');
        compressed = true;
        
        const ratio = CompressionManager.getCompressionRatio(
          Buffer.byteLength(dataString),
          compressedBuffer.length
        );
        
        logger.debug('Response compressed', {
          key,
          originalSize: Buffer.byteLength(dataString),
          compressedSize: compressedBuffer.length,
          ratio: `${ratio}%`
        });
      } catch (error) {
        logger.warn('Compression failed, storing uncompressed', {
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const entry: CacheEntry = {
      data: finalData,
      headers,
      statusCode,
      timestamp,
      ttl: config.ttl,
      compressed,
      tags: config.tags || [],
      accessCount: 0,
      lastAccess: timestamp,
      size: Buffer.byteLength(finalData)
    };

    // Store in both caches
    await Promise.all([
      this.memoryCache.set(key, entry),
      this.redisCache.set(key, entry)
    ]);

    logger.debug('Cache set', {
      key,
      size: entry.size,
      ttl: config.ttl,
      compressed,
      tags: config.tags
    });
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.memoryCache.delete(key),
      this.redisCache.delete(key)
    ]);
  }

  async deleteByTags(tags: string[]): Promise<void> {
    const [memoryDeleted, redisDeleted] = await Promise.all([
      this.memoryCache.deleteByTags(tags),
      this.redisCache.deleteByTags(tags)
    ]);

    logger.info('Cache invalidation by tags', {
      tags,
      memoryDeleted,
      redisDeleted
    });
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.memoryCache.clear(),
      this.redisCache.clear()
    ]);
    this.queryCache.clear();
  }

  // Query caching for database results
  async getQuery(query: string, params: any[]): Promise<any | null> {
    const key = CacheKeyGenerator.generateQueryKey(query, params);
    const entry = this.queryCache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.queryCache.delete(key);
      return null;
    }

    logger.debug('Query cache hit', { query: query.substring(0, 100) });
    return entry.result;
  }

  async setQuery(query: string, params: any[], result: any, ttl: number = 300, tags: string[] = []): Promise<void> {
    const key = CacheKeyGenerator.generateQueryKey(query, params);
    
    const entry: QueryCacheEntry = {
      result,
      timestamp: Date.now(),
      ttl,
      query,
      params,
      tags
    };

    this.queryCache.set(key, entry);
    
    logger.debug('Query cache set', {
      query: query.substring(0, 100),
      ttl,
      tags
    });
  }

  async invalidateQueryTags(tags: string[]): Promise<void> {
    let deleted = 0;
    
    for (const [key, entry] of this.queryCache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.queryCache.delete(key);
        deleted++;
      }
    }

    logger.info('Query cache invalidation by tags', {
      tags,
      deleted
    });
  }

  getMetrics(): {
    memory: CacheMetrics;
    redis: CacheMetrics;
    query: { entries: number; sizeMB: number };
    combined: CacheMetrics;
  } {
    const memoryMetrics = this.memoryCache.getMetrics();
    const redisMetrics = this.redisCache.getMetrics();
    
    const querySize = Array.from(this.queryCache.values())
      .reduce((total, entry) => total + JSON.stringify(entry.result).length, 0);

    const combined: CacheMetrics = {
      hits: memoryMetrics.hits + redisMetrics.hits,
      misses: memoryMetrics.misses + redisMetrics.misses,
      sets: memoryMetrics.sets + redisMetrics.sets,
      deletes: memoryMetrics.deletes + redisMetrics.deletes,
      evictions: memoryMetrics.evictions + redisMetrics.evictions,
      totalSize: memoryMetrics.totalSize + redisMetrics.totalSize,
      averageResponseTime: (memoryMetrics.averageResponseTime + redisMetrics.averageResponseTime) / 2,
      hitRate: 0,
      lastReset: Math.min(memoryMetrics.lastReset, redisMetrics.lastReset)
    };

    const totalRequests = combined.hits + combined.misses;
    combined.hitRate = totalRequests > 0 ? (combined.hits / totalRequests) * 100 : 0;

    return {
      memory: memoryMetrics,
      redis: redisMetrics,
      query: {
        entries: this.queryCache.size,
        sizeMB: Math.round(querySize / 1024 / 1024 * 100) / 100
      },
      combined
    };
  }

  getStats(): any {
    return {
      memory: this.memoryCache.getStats(),
      query: {
        entries: this.queryCache.size,
        topQueries: Array.from(this.queryCache.entries())
          .map(([key, entry]) => ({
            query: entry.query.substring(0, 100) + (entry.query.length > 100 ? '...' : ''),
            timestamp: entry.timestamp,
            tags: entry.tags
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)
      }
    };
  }
}

// ============================================================================
// CACHE MIDDLEWARE
// ============================================================================

const cacheManager = new CacheManager();

export const createCacheMiddleware = (config: CacheConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests by default
    if (req.method !== 'GET') {
      return next();
    }

    // Check exclude patterns
    if (config.excludePatterns?.some(pattern => pattern.test(req.originalUrl))) {
      return next();
    }

    // Check include patterns (if specified, URL must match)
    if (config.includePatterns && !config.includePatterns.some(pattern => pattern.test(req.originalUrl))) {
      return next();
    }

    const cacheKey = CacheKeyGenerator.generateKey(req, config.varyBy);
    
    try {
      // Try to get from cache
      const cachedEntry = await cacheManager.get(cacheKey);
      
      if (cachedEntry) {
        // Handle stale-while-revalidate
        const age = (Date.now() - cachedEntry.timestamp) / 1000;
        const isStale = age > cachedEntry.ttl;
        const shouldRevalidate = config.staleWhileRevalidate && 
          age > (cachedEntry.ttl - config.staleWhileRevalidate);

        if (shouldRevalidate && !isStale) {
          // Serve from cache but trigger background revalidation
          setImmediate(() => {
            // Background revalidation would go here
            logger.debug('Background revalidation triggered', { cacheKey });
          });
        }

        if (!isStale || (isStale && config.staleWhileRevalidate)) {
          // Decompress if needed
          let responseData = cachedEntry.data;
          if (cachedEntry.compressed) {
            try {
              const buffer = Buffer.from(cachedEntry.data, 'base64');
              responseData = await CompressionManager.decompress(buffer);
              responseData = JSON.parse(responseData);
            } catch (error) {
              logger.error('Cache decompression failed', {
                cacheKey,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
              return next();
            }
          } else {
            responseData = JSON.parse(cachedEntry.data);
          }

          // Set cached headers
          Object.entries(cachedEntry.headers).forEach(([key, value]) => {
            res.set(key, value);
          });

          // Add cache headers
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Age', Math.floor(age).toString());
          
          if (isStale) {
            res.set('X-Cache-Status', 'STALE');
          }

          logger.debug('Cache hit served', {
            cacheKey,
            age: Math.floor(age),
            stale: isStale
          });

          return res.status(cachedEntry.statusCode).json(responseData);
        }
      }

      // Cache miss - continue to route handler
      res.set('X-Cache', 'MISS');

      // Intercept response
      const originalJson = res.json;
      const originalSend = res.send;
      let responseData: any;
      let responseSent = false;

      res.json = function(data: any) {
        if (!responseSent) {
          responseData = data;
          responseSent = true;
          
          // Cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            setImmediate(async () => {
              try {
                const headers: Record<string, string> = {};
                
                // Capture important headers
                ['content-type', 'etag', 'last-modified'].forEach(header => {
                  const value = res.get(header);
                  if (value) headers[header] = value;
                });

                await cacheManager.set(cacheKey, data, headers, res.statusCode, config);
              } catch (error) {
                logger.error('Failed to cache response', {
                  cacheKey,
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            });
          }
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', {
        cacheKey,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next();
    }
  };
};

// ============================================================================
// CACHE INVALIDATION MIDDLEWARE
// ============================================================================

export const createCacheInvalidationMiddleware = (tags: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original end function
    const originalEnd = res.end;

    res.end = function(chunk?: any, encoding?: any) {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300 && 
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        
        setImmediate(async () => {
          try {
            await cacheManager.deleteByTags(tags);
            await cacheManager.invalidateQueryTags(tags);
            
            logger.info('Cache invalidated', {
              method: req.method,
              url: req.originalUrl,
              tags,
              statusCode: res.statusCode
            });
          } catch (error) {
            logger.error('Cache invalidation failed', {
              tags,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        });
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// ============================================================================
// PREDEFINED CACHE CONFIGURATIONS
// ============================================================================

export const cacheConfigs = {
  // Short-term caching for frequently accessed data
  short: {
    ttl: 60, // 1 minute
    compression: false,
    excludePatterns: [/\/auth\//, /\/admin\//],
    varyBy: ['authorization']
  },

  // Medium-term caching for semi-static data
  medium: {
    ttl: 300, // 5 minutes
    compression: true,
    excludePatterns: [/\/auth\//, /\/admin\//, /\/api\/security\//],
    varyBy: ['authorization'],
    staleWhileRevalidate: 60
  },

  // Long-term caching for static data
  long: {
    ttl: 3600, // 1 hour
    compression: true,
    includePatterns: [/\/api\/reference\//, /\/api\/systemconfig\//],
    varyBy: [],
    staleWhileRevalidate: 300
  },

  // User-specific caching
  user: {
    ttl: 180, // 3 minutes
    compression: true,
    excludePatterns: [/\/auth\//, /\/admin\//],
    varyBy: ['authorization'],
    tags: ['user-data']
  },

  // Company-specific caching
  company: {
    ttl: 600, // 10 minutes
    compression: true,
    varyBy: ['authorization'],
    tags: ['company-data'],
    staleWhileRevalidate: 120
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  cacheManager,
  CacheKeyGenerator,
  CompressionManager,
  type CacheConfig,
  type CacheEntry,
  type CacheMetrics
};

export default {
  createCacheMiddleware,
  createCacheInvalidationMiddleware,
  cacheConfigs,
  cacheManager
}; 
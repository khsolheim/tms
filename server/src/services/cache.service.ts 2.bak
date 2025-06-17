/**
 * Cache Service
 * 
 * Redis-basert caching for optimal database performance
 * og API response caching
 */

import Redis from 'ioredis';
import logger from '../utils/logger';

// ============================================================================
// REDIS CONFIGURATION
// ============================================================================

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  retryBackoffTime: 30000,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'tms:',
};

// ============================================================================
// REDIS CLIENT
// ============================================================================

class CacheService {
  private redis: Redis;
  private isConnected = false;

  constructor() {
    this.redis = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.redis.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.redis.disconnect();
    }
  }

  // ============================================================================
  // BASIC CACHE OPERATIONS
  // ============================================================================

  /**
   * Set cache med TTL
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      logger.debug(`Cache set: ${key}`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Get cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(cached);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache pattern deleted: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error('Cache pattern delete error:', error);
    }
  }

  // ============================================================================
  // ADVANCED CACHE PATTERNS
  // ============================================================================

  /**
   * Cache-aside pattern med automatic fallback
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    try {
      const data = await fetcher();
      await this.set(key, data, ttlSeconds);
      return data;
    } catch (error) {
      logger.error('Cache getOrSet fetcher error:', error);
      throw error;
    }
  }

  /**
   * Distributed lock for preventing cache stampede
   */
  async withLock<T>(
    lockKey: string,
    operation: () => Promise<T>,
    lockTtlSeconds: number = 30
  ): Promise<T> {
    const lockValue = `${Date.now()}-${Math.random()}`;
    const acquired = await this.redis.set(
      `lock:${lockKey}`,
      lockValue,
      'EX',
      lockTtlSeconds,
      'NX'
    );

    if (!acquired) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Could not acquire lock');
    }

    try {
      const result = await operation();
      return result;
    } finally {
      // Release lock if it's still ours
      const currentLock = await this.redis.get(`lock:${lockKey}`);
      if (currentLock === lockValue) {
        await this.redis.del(`lock:${lockKey}`);
      }
    }
  }

  /**
   * Multi-level cache with fallback
   */
  async getMultiLevel<T>(
    keys: string[],
    fetcher: (missingKeys: string[]) => Promise<Record<string, T>>,
    ttlSeconds: number = 300
  ): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    const missingKeys: string[] = [];

    // Get all keys from cache
    const pipeline = this.redis.pipeline();
    keys.forEach(key => pipeline.get(key));
    const cached = await pipeline.exec();

    // Process cached results
    keys.forEach((key, index) => {
      const [error, value] = cached![index];
      if (!error && value) {
        try {
          result[key] = JSON.parse(value as string);
        } catch {
          missingKeys.push(key);
        }
      } else {
        missingKeys.push(key);
      }
    });

    // Fetch missing data
    if (missingKeys.length > 0) {
      try {
        const freshData = await fetcher(missingKeys);
        
        // Cache fresh data
        const setPipeline = this.redis.pipeline();
        Object.entries(freshData).forEach(([key, value]) => {
          setPipeline.setex(key, ttlSeconds, JSON.stringify(value));
          result[key] = value;
        });
        await setPipeline.exec();
      } catch (error) {
        logger.error('Multi-level cache fetcher error:', error);
      }
    }

    return result;
  }

  // ============================================================================
  // CACHE INVALIDATION STRATEGIES
  // ============================================================================

  /**
   * Tag-based cache invalidation
   */
  async setWithTags(
    key: string,
    value: any,
    tags: string[],
    ttlSeconds?: number
  ): Promise<void> {
    await this.set(key, value, ttlSeconds);
    
    // Add to tag sets
    const pipeline = this.redis.pipeline();
    tags.forEach(tag => {
      pipeline.sadd(`tag:${tag}`, key);
      if (ttlSeconds) {
        pipeline.expire(`tag:${tag}`, ttlSeconds + 60); // Tags live longer
      }
    });
    await pipeline.exec();
  }

  /**
   * Invalidate all keys with specific tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
        logger.debug(`Invalidated tag ${tag}: ${keys.length} keys`);
      }
    }
  }

  // ============================================================================
  // SPECIALIZED CACHE METHODS
  // ============================================================================

  /**
   * Session caching
   */
  async setSession(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttlSeconds);
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  /**
   * API response caching
   */
  async cacheApiResponse(
    endpoint: string,
    params: Record<string, any>,
    response: any,
    ttlSeconds: number = 300
  ): Promise<void> {
    const cacheKey = this.generateApiCacheKey(endpoint, params);
    await this.setWithTags(cacheKey, response, [`api:${endpoint}`], ttlSeconds);
  }

  async getCachedApiResponse<T>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T | null> {
    const cacheKey = this.generateApiCacheKey(endpoint, params);
    return await this.get<T>(cacheKey);
  }

  async invalidateApiCache(endpoint: string): Promise<void> {
    await this.invalidateByTags([`api:${endpoint}`]);
  }

  /**
   * Database query result caching
   */
  async cacheQueryResult(
    query: string,
    params: any[],
    result: any,
    ttlSeconds: number = 600
  ): Promise<void> {
    const cacheKey = this.generateQueryCacheKey(query, params);
    await this.set(cacheKey, result, ttlSeconds);
  }

  async getCachedQueryResult<T>(query: string, params: any[]): Promise<T | null> {
    const cacheKey = this.generateQueryCacheKey(query, params);
    return await this.get<T>(cacheKey);
  }

  // ============================================================================
  // CACHE STATISTICS
  // ============================================================================

  async getStats(): Promise<{
    memory: any;
    clients: number;
    hits: number;
    misses: number;
    keys: number;
  }> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      const stats = await this.redis.info('stats');

      return {
        memory: this.parseRedisInfo(info),
        clients: 1, // Simplified for now
        hits: this.extractStat(stats, 'keyspace_hits'),
        misses: this.extractStat(stats, 'keyspace_misses'),
        keys: this.extractKeyCount(keyspace),
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        memory: {},
        clients: 0,
        hits: 0,
        misses: 0,
        keys: 0,
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateApiCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `api:${endpoint}:${Buffer.from(sortedParams).toString('base64')}`;
  }

  private generateQueryCacheKey(query: string, params: any[]): string {
    const paramsStr = params.map(p => JSON.stringify(p)).join('|');
    return `query:${Buffer.from(`${query}|${paramsStr}`).toString('base64')}`;
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    lines.forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    });
    return result;
  }

  private extractStat(stats: string, statName: string): number {
    const match = stats.match(new RegExp(`${statName}:(\\d+)`));
    return match ? parseInt(match[1]) : 0;
  }

  private extractKeyCount(keyspace: string): number {
    const match = keyspace.match(/keys=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cacheService = new CacheService();
export default cacheService; 
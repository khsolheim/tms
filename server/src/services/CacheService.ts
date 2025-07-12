import Redis from 'ioredis';
import { createHash } from 'crypto';

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  incrementCounter(key: string, ttl?: number): Promise<number>;
  cacheUserData<T>(userId: number, dataType: string, data: T, ttl?: number): Promise<void>;
  getUserData<T>(userId: number, dataType: string): Promise<T | null>;
  invalidateUserCache(userId: number, dataType?: string): Promise<void>;
  healthCheck(): Promise<boolean>;
  cacheQueryResult<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl?: number,
    invalidationTags?: string[]
  ): Promise<T>;
  invalidateByTags(tags: string[]): Promise<void>;
}

class RedisCacheService implements CacheService {
  private redis: Redis;
  private readonly defaultTTL = 3600; // 1 hour
  private readonly keyPrefix = 'tms:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private generateCacheKey(...parts: any[]): string {
    const keyString = parts.map(part => 
      typeof part === 'object' ? JSON.stringify(part) : String(part)
    ).join(':');
    
    // For very long keys, use hash
    if (keyString.length > 200) {
      return createHash('sha256').update(keyString).digest('hex');
    }
    
    return keyString;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const prefixedKey = this.prefixKey(key);
      const value = await this.redis.get(prefixedKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;

      await this.redis.setex(prefixedKey, expiry, serialized);
    } catch (error) {
      console.error('Cache set error:', error);
      // Don't throw error to prevent cache issues from breaking app
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const prefixedPattern = this.prefixKey(pattern);
      const keys = await this.redis.keys(prefixedPattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const prefixedKey = this.prefixKey(key);
      await this.redis.del(prefixedKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const prefixedKey = this.prefixKey(key);
      const result = await this.redis.exists(prefixedKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async incrementCounter(key: string, ttl?: number): Promise<number> {
    try {
      const prefixedKey = this.prefixKey(key);
      const result = await this.redis.incr(prefixedKey);
      
      if (result === 1 && ttl) {
        await this.redis.expire(prefixedKey, ttl);
      }
      
      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Query result caching with automatic invalidation
  async cacheQueryResult<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl?: number,
    invalidationTags?: string[]
  ): Promise<T> {
    const cacheKey = this.generateCacheKey('query', queryKey);
    
    // Try to get from cache first
    const cached = await this.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute query and cache result
    const result = await queryFn();
    await this.set(cacheKey, result, ttl);

    // Store invalidation tags if provided
    if (invalidationTags) {
      for (const tag of invalidationTags) {
        const tagKey = this.generateCacheKey('tag', tag);
        await this.redis.sadd(tagKey, cacheKey);
        if (ttl) {
          await this.redis.expire(tagKey, ttl);
        }
      }
    }

    return result;
  }

  // Invalidate by tags
  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = this.generateCacheKey('tag', tag);
      const cacheKeys = await this.redis.smembers(tagKey);
      
      if (cacheKeys.length > 0) {
        await this.redis.del(...cacheKeys);
      }
      
      await this.redis.del(tagKey);
    }
  }

  // Session caching
  async cacheSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    const key = this.generateCacheKey('session', sessionId);
    await this.set(key, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    const key = this.generateCacheKey('session', sessionId);
    return this.get<T>(key);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = this.generateCacheKey('session', sessionId);
    await this.delete(key);
  }

  // User-specific caching
  async cacheUserData<T>(userId: number, dataType: string, data: T, ttl?: number): Promise<void> {
    const key = this.generateCacheKey('user', userId, dataType);
    await this.set(key, data, ttl);
  }

  async getUserData<T>(userId: number, dataType: string): Promise<T | null> {
    const key = this.generateCacheKey('user', userId, dataType);
    return this.get<T>(key);
  }

  async invalidateUserCache(userId: number, dataType?: string): Promise<void> {
    if (dataType) {
      const key = this.generateCacheKey('user', userId, dataType);
      await this.delete(key);
    } else {
      const pattern = this.generateCacheKey('user', userId, '*');
      await this.invalidate(pattern);
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cleanup and disconnect
  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }
}

// In-memory fallback cache service
class InMemoryCacheService implements CacheService {
  private cache = new Map<string, { value: any; expires: number }>();
  private readonly defaultTTL = 3600;

  private isExpired(item: { expires: number }): boolean {
    return Date.now() > item.expires;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item || this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = Date.now() + (ttl || this.defaultTTL) * 1000;
    this.cache.set(key, { value, expires });

    // Periodic cleanup
    if (this.cache.size % 100 === 0) {
      this.cleanup();
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  async incrementCounter(key: string, ttl?: number): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + 1;
    await this.set(key, newValue, ttl);
    return newValue;
  }

  async cacheUserData<T>(userId: number, dataType: string, data: T, ttl?: number): Promise<void> {
    const key = `user:${userId}:${dataType}`;
    await this.set(key, data, ttl);
  }

  async getUserData<T>(userId: number, dataType: string): Promise<T | null> {
    const key = `user:${userId}:${dataType}`;
    return this.get<T>(key);
  }

  async invalidateUserCache(userId: number, dataType?: string): Promise<void> {
    if (dataType) {
      const key = `user:${userId}:${dataType}`;
      await this.delete(key);
    } else {
      const pattern = `user:${userId}:*`;
      await this.invalidate(pattern);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.set('health_check', 'ok', 1);
      const result = await this.get('health_check');
      await this.delete('health_check');
      return result === 'ok';
    } catch {
      return false;
    }
  }

  async cacheQueryResult<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl?: number,
    invalidationTags?: string[]
  ): Promise<T> {
    const cached = await this.get<T>(queryKey);
    if (cached !== null) {
      return cached;
    }

    const result = await queryFn();
    await this.set(queryKey, result, ttl);
    return result;
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    // Simple implementation for in-memory cache
    // In a real scenario, you'd want to track tag relationships
    for (const tag of tags) {
      await this.invalidate(`*${tag}*`);
    }
  }
}

// Cache service factory
export function createCacheService(): CacheService {
  if (process.env.REDIS_HOST) {
    return new RedisCacheService();
  } else {
    console.warn('Redis not configured, using in-memory cache');
    return new InMemoryCacheService();
  }
}

export const cacheService = createCacheService();
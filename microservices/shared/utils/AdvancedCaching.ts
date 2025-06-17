import Redis from 'redis';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

export class AdvancedCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0
  };
  private config: CacheConfig;
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor(config: CacheConfig) {
    this.config = {
      defaultTTL: 3600, // 1 hour default
      keyPrefix: 'tms:',
      ...config
    };

    console.log('✅ Advanced Cache Manager initialized');
  }

  private getKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.timestamp + (entry.ttl * 1000);
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Basic cache operations
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.getKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (!entry) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      if (this.isExpired(entry)) {
        await this.delete(key);
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();
      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  async set<T>(
    key: string, 
    data: T, 
    options?: {
      ttl?: number;
      tags?: string[];
      version?: string;
    }
  ): Promise<void> {
    try {
      const cacheKey = this.getKey(key);
      const ttl = options?.ttl || this.config.defaultTTL!;
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        version: options?.version,
        tags: options?.tags
      };

      this.cache.set(cacheKey, entry);
      
      // Store tags for cache invalidation
      if (options?.tags) {
        for (const tag of options.tags) {
          if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
          }
          this.tagIndex.get(tag)!.add(key);
        }
      }

      this.stats.sets++;
      
      // Auto-cleanup expired entries
      setTimeout(() => {
        if (this.cache.has(cacheKey) && this.isExpired(this.cache.get(cacheKey)!)) {
          this.delete(key);
        }
      }, ttl * 1000);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.getKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (entry?.tags) {
        for (const tag of entry.tags) {
          const tagSet = this.tagIndex.get(tag);
          if (tagSet) {
            tagSet.delete(key);
            if (tagSet.size === 0) {
              this.tagIndex.delete(tag);
            }
          }
        }
      }
      
      this.cache.delete(cacheKey);
      this.stats.deletes++;
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Advanced cache operations
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      tags?: string[];
      version?: string;
    }
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  async mset<T>(entries: Array<{ key: string; data: T; ttl?: number }>): Promise<void> {
    const promises = entries.map(entry => 
      this.set(entry.key, entry.data, { ttl: entry.ttl })
    );
    await Promise.all(promises);
  }

  // Tag-based cache invalidation
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        const deletePromises = Array.from(keys).map(key => this.delete(key));
        await Promise.all(deletePromises);
        this.tagIndex.delete(tag);
      }
    } catch (error) {
      console.error('Cache invalidate by tag error:', error);
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const keysToDelete: string[] = [];
      
      for (const [cacheKey] of this.cache) {
        const originalKey = cacheKey.replace(this.config.keyPrefix!, '');
        if (regex.test(originalKey)) {
          keysToDelete.push(originalKey);
        }
      }
      
      const deletePromises = keysToDelete.map(key => this.delete(key));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cache invalidate by pattern error:', error);
    }
  }

  // Cache warming
  async warmCache<T>(
    entries: Array<{
      key: string;
      fetcher: () => Promise<T>;
      ttl?: number;
      tags?: string[];
    }>
  ): Promise<void> {
    console.log(`🔥 Warming cache with ${entries.length} entries...`);
    
    const promises = entries.map(async (entry) => {
      try {
        const data = await entry.fetcher();
        await this.set(entry.key, data, {
          ttl: entry.ttl,
          tags: entry.tags
        });
      } catch (error) {
        console.error(`Failed to warm cache for key ${entry.key}:`, error);
      }
    });

    await Promise.all(promises);
    console.log('✅ Cache warming completed');
  }

  // Cache statistics and monitoring
  getStats(): CacheStats {
    return { ...this.stats };
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getMemoryUsage(): { entries: number; tags: number } {
    return {
      entries: this.cache.size,
      tags: this.tagIndex.size
    };
  }

  // Cache health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    memoryUsage: { entries: number; tags: number };
    stats: CacheStats;
  }> {
    const start = Date.now();
    
    try {
      // Test cache operations
      const testKey = 'health-check-test';
      await this.set(testKey, 'test-data', { ttl: 1 });
      const result = await this.get(testKey);
      await this.delete(testKey);
      
      const latency = Date.now() - start;
      
      return {
        status: result === 'test-data' ? 'healthy' : 'unhealthy',
        latency,
        memoryUsage: this.getMemoryUsage(),
        stats: this.getStats()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start,
        memoryUsage: this.getMemoryUsage(),
        stats: this.getStats()
      };
    }
  }

  // Distributed locking (simplified in-memory version)
  private locks: Map<string, { value: string; expires: number }> = new Map();

  async acquireLock(
    lockKey: string, 
    ttl: number = 30, 
    retryDelay: number = 100,
    maxRetries: number = 10
  ): Promise<string | null> {
    const lockValue = `${Date.now()}_${Math.random()}`;
    const fullKey = this.getKey(`lock:${lockKey}`);
    
    for (let i = 0; i < maxRetries; i++) {
      const existingLock = this.locks.get(fullKey);
      
      if (!existingLock || Date.now() > existingLock.expires) {
        this.locks.set(fullKey, {
          value: lockValue,
          expires: Date.now() + (ttl * 1000)
        });
        return lockValue;
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    return null;
  }

  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const fullKey = this.getKey(`lock:${lockKey}`);
    const existingLock = this.locks.get(fullKey);
    
    if (existingLock && existingLock.value === lockValue) {
      this.locks.delete(fullKey);
      return true;
    }
    
    return false;
  }

  // Cache preloading strategies
  async preloadUserData(userId: string): Promise<void> {
    const userKey = `user:${userId}`;
    const quizResultsKey = `user:${userId}:quiz-results`;
    const invoicesKey = `user:${userId}:invoices`;
    
    await this.warmCache([
      {
        key: userKey,
        fetcher: async () => ({ id: userId, name: 'User Data' }),
        ttl: 1800, // 30 minutes
        tags: ['user', `user:${userId}`]
      },
      {
        key: quizResultsKey,
        fetcher: async () => ([]), // Fetch from quiz service
        ttl: 900, // 15 minutes
        tags: ['quiz', `user:${userId}`]
      },
      {
        key: invoicesKey,
        fetcher: async () => ([]), // Fetch from economy service
        ttl: 600, // 10 minutes
        tags: ['invoice', `user:${userId}`]
      }
    ]);
  }

  async preloadBedriftData(bedriftId: string): Promise<void> {
    const bedriftKey = `bedrift:${bedriftId}`;
    const employeesKey = `bedrift:${bedriftId}:employees`;
    const quizzesKey = `bedrift:${bedriftId}:quizzes`;
    
    await this.warmCache([
      {
        key: bedriftKey,
        fetcher: async () => ({ id: bedriftId, name: 'Bedrift Data' }),
        ttl: 3600, // 1 hour
        tags: ['bedrift', `bedrift:${bedriftId}`]
      },
      {
        key: employeesKey,
        fetcher: async () => ([]), // Fetch from user service
        ttl: 1800, // 30 minutes
        tags: ['user', `bedrift:${bedriftId}`]
      },
      {
        key: quizzesKey,
        fetcher: async () => ([]), // Fetch from quiz service
        ttl: 1800, // 30 minutes
        tags: ['quiz', `bedrift:${bedriftId}`]
      }
    ]);
  }

  // Cleanup expired entries
  async cleanup(): Promise<void> {
    const expiredKeys: string[] = [];
    
    for (const [cacheKey, entry] of this.cache) {
      if (this.isExpired(entry)) {
        const originalKey = cacheKey.replace(this.config.keyPrefix!, '');
        expiredKeys.push(originalKey);
      }
    }
    
    const deletePromises = expiredKeys.map(key => this.delete(key));
    await Promise.all(deletePromises);
    
    console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
  }
}

// Cache decorators for easy usage
export function Cacheable(options?: {
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
  tags?: string[];
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cache = getCacheManager();
      if (!cache) {
        return method.apply(this, args);
      }
      
      const key = options?.keyGenerator 
        ? options.keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      return cache.getOrSet(key, () => method.apply(this, args), {
        ttl: options?.ttl,
        tags: options?.tags
      });
    };
  };
}

export function CacheEvict(options?: {
  keyPattern?: string;
  tags?: string[];
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      const cache = getCacheManager();
      if (cache) {
        if (options?.keyPattern) {
          await cache.invalidateByPattern(options.keyPattern);
        }
        
        if (options?.tags) {
          for (const tag of options.tags) {
            await cache.invalidateByTag(tag);
          }
        }
      }
      
      return result;
    };
  };
}

// Global cache manager instance
let globalCacheManager: AdvancedCacheManager | null = null;

export function initializeCacheManager(config: CacheConfig): AdvancedCacheManager {
  globalCacheManager = new AdvancedCacheManager(config);
  
  // Start cleanup interval
  setInterval(() => {
    globalCacheManager?.cleanup();
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
  
  return globalCacheManager;
}

export function getCacheManager(): AdvancedCacheManager | null {
  return globalCacheManager;
}

// Cache strategies
export class CacheStrategies {
  static readonly WRITE_THROUGH = 'write-through';
  static readonly WRITE_BEHIND = 'write-behind';
  static readonly CACHE_ASIDE = 'cache-aside';
  static readonly REFRESH_AHEAD = 'refresh-ahead';
}

// Cache patterns for common use cases
export const CachePatterns = {
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_PERMISSIONS: (userId: string) => `user:permissions:${userId}`,
  BEDRIFT_DATA: (bedriftId: string) => `bedrift:data:${bedriftId}`,
  QUIZ_RESULTS: (userId: string, quizId?: string) => 
    quizId ? `quiz:results:${userId}:${quizId}` : `quiz:results:${userId}`,
  INVOICE_LIST: (bedriftId: string, filters?: string) => 
    `invoices:${bedriftId}:${filters || 'all'}`,
  DASHBOARD_DATA: (bedriftId: string) => `dashboard:${bedriftId}`,
  ANALYTICS: (bedriftId: string, period: string) => `analytics:${bedriftId}:${period}`
}; 
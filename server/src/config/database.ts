import { PrismaClient } from '@prisma/client';
import { getEnvironment } from './environment';
import logger from '../utils/logger';

// ============================================================================
// DATABASE CONFIGURATION & CONNECTION POOLING
// ============================================================================

interface DatabaseConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  queryTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  slowQueryThreshold: number;
}

interface DatabaseMetrics {
  totalQueries: number;
  slowQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  connectionPoolSize: number;
  activeConnections: number;
  lastHealthCheck: Date;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private prisma: PrismaClient | null = null;
  private config: DatabaseConfig;
  private metrics: DatabaseMetrics;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  private constructor() {
    // Initialize metrics first
    this.metrics = {
      totalQueries: 0,
      slowQueries: 0,
      failedQueries: 0,
      averageQueryTime: 0,
      connectionPoolSize: 0,
      activeConnections: 0,
      lastHealthCheck: new Date()
    };

    // Config will be set when initialize is called
    this.config = {
      maxConnections: 10,
      minConnections: 2,
      connectionTimeout: 10000,
      idleTimeout: 300000,
      maxLifetime: 3600000,
      queryTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: false,
      slowQueryThreshold: 1000
    };
  }

  public async initialize(): Promise<void> {
    const env = getEnvironment();
    
    this.config = {
      maxConnections: env.DATABASE_MAX_CONNECTIONS || 10,
      minConnections: env.DATABASE_MIN_CONNECTIONS || 2,
      connectionTimeout: env.DATABASE_CONNECTION_TIMEOUT || 10000,
      idleTimeout: env.DATABASE_IDLE_TIMEOUT || 300000, // 5 minutter
      maxLifetime: env.DATABASE_MAX_LIFETIME || 3600000, // 1 time
      queryTimeout: env.DATABASE_QUERY_TIMEOUT || 30000,
      retryAttempts: env.DATABASE_RETRY_ATTEMPTS || 3,
      retryDelay: env.DATABASE_RETRY_DELAY || 1000,
      enableLogging: env.NODE_ENV !== 'production',
      slowQueryThreshold: env.DATABASE_SLOW_QUERY_THRESHOLD || 1000
    };

    await this.initializeDatabase();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const env = getEnvironment();
      
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: env.DATABASE_URL
          }
        },
        log: this.config.enableLogging ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
          { emit: 'stdout', level: 'info' }
        ] : [{ emit: 'event', level: 'error' }],
        errorFormat: 'pretty'
      });

      // Sett opp event listeners for logging og metrics
      this.setupEventListeners();

      // Test tilkobling
      await this.testConnection();
      
      // Start health check
      this.startHealthCheck();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      logger.info('Database tilkobling etablert', {
        maxConnections: this.config.maxConnections,
        queryTimeout: this.config.queryTimeout,
        slowQueryThreshold: this.config.slowQueryThreshold
      });

    } catch (error) {
      logger.error('Feil ved initialisering av database', { 
        error: error instanceof Error ? error.message : error 
      });
      await this.handleConnectionError();
    }
  }

  private setupEventListeners(): void {
    if (!this.prisma) return;

    try {
      // Query logging og metrics (kun hvis logging er aktivert)
      if (this.config.enableLogging) {
        (this.prisma as any).$on('query', (event: any) => {
          const duration = event.duration;
          this.metrics.totalQueries++;
          
          // Oppdater gjennomsnittlig query-tid
          this.metrics.averageQueryTime = 
            (this.metrics.averageQueryTime * (this.metrics.totalQueries - 1) + duration) / 
            this.metrics.totalQueries;

          // Logg langsomme queries
          if (duration > this.config.slowQueryThreshold) {
            this.metrics.slowQueries++;
            logger.warn('Langsom database query', {
              query: event.query,
              duration: `${duration}ms`,
              params: event.params
            });
          }

          // Debug logging i development
          if (duration > 100) {
            logger.debug('Database query', {
              query: event.query.substring(0, 100) + '...',
              duration: `${duration}ms`
            });
          }
        });
      }

      // Error logging (alltid aktivt)
      (this.prisma as any).$on('error', (event: any) => {
        this.metrics.failedQueries++;
        logger.error('Database error', {
          message: event.message,
          target: event.target
        });
      });

      // Warning logging (alltid aktivt)
      (this.prisma as any).$on('warn', (event: any) => {
        logger.warn('Database warning', {
          message: event.message,
          target: event.target
        });
      });
    } catch (error) {
      logger.warn('Could not setup database event listeners', {
        error: error instanceof Error ? error.message : error
      });
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma client ikke initialisert');
    }

    const startTime = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - startTime;
    
    logger.info('Database tilkoblingstest vellykket', { 
      duration: `${duration}ms` 
    });
  }

  private startHealthCheck(): void {
    // Kjør health check hvert 30. sekund
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      if (!this.prisma) return;

      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - startTime;

      this.metrics.lastHealthCheck = new Date();
      this.isConnected = true;

      // Logg kun hvis health check tar lang tid
      if (duration > 1000) {
        logger.warn('Database health check langsom', { 
          duration: `${duration}ms` 
        });
      }

    } catch (error) {
      this.isConnected = false;
      logger.error('Database health check feilet', { 
        error: error instanceof Error ? error.message : error 
      });
      await this.handleConnectionError();
    }
  }

  private async handleConnectionError(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Maksimalt antall reconnect-forsøk nådd', {
        attempts: this.reconnectAttempts
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.retryDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    logger.info('Forsøker å koble til database på nytt', {
      attempt: this.reconnectAttempts,
      delay: `${delay}ms`
    });

    setTimeout(async () => {
      await this.initializeDatabase();
    }, delay);
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  public getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database ikke tilkoblet');
    }
    return this.prisma;
  }

  public isHealthy(): boolean {
    return this.isConnected && this.prisma !== null;
  }

  public getMetrics(): DatabaseMetrics {
    return { ...this.metrics };
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  // Optimaliserte query-metoder
  public async executeWithRetry<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    maxRetries: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.prisma) {
          throw new Error('Database ikke tilkoblet');
        }

        const startTime = Date.now();
        const result = await operation(this.prisma);
        const duration = Date.now() - startTime;

        // Logg langsomme operasjoner
        if (duration > this.config.slowQueryThreshold) {
          logger.warn('Langsom database operasjon', {
            duration: `${duration}ms`,
            attempt
          });
        }

        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.metrics.failedQueries++;

        logger.warn('Database operasjon feilet', {
          attempt,
          maxRetries,
          error: lastError.message
        });

        if (attempt < maxRetries) {
          const delay = this.config.retryDelay * attempt;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Database operasjon feilet etter flere forsøk');
  }

  // Batch operasjoner for bedre ytelse
  public async executeBatch<T>(
    operations: ((prisma: PrismaClient) => Promise<T>)[],
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(op => this.executeWithRetry(op))
      );
      results.push(...batchResults);
    }

    return results;
  }

  // Transaksjoner med timeout
  public async executeTransaction<T>(
    operation: (prisma: PrismaClient) => Promise<T>,
    timeout: number = this.config.queryTimeout
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database ikke tilkoblet');
    }

    return Promise.race([
      this.prisma.$transaction(async (tx) => {
        return await operation(tx as PrismaClient);
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Transaksjon timeout etter ${timeout}ms`));
        }, timeout);
      })
    ]);
  }

  // Graceful shutdown
  public async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.prisma) {
      logger.info('Kobler fra database...');
      await this.prisma.$disconnect();
      this.prisma = null;
      this.isConnected = false;
      logger.info('Database frakoblet');
    }
  }

  // Cache invalidation helper
  public async invalidateCache(patterns: string[] = []): Promise<void> {
    // Implementer cache invalidation logikk her
    logger.info('Cache invalidert', { patterns });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Convenience exports (lazy initialization)
export const getPrisma = () => databaseManager.getClient();
export const executeWithRetry = databaseManager.executeWithRetry.bind(databaseManager);
export const executeBatch = databaseManager.executeBatch.bind(databaseManager);
export const executeTransaction = databaseManager.executeTransaction.bind(databaseManager);

// Health check endpoint data
export const getDatabaseHealth = () => ({
  isHealthy: databaseManager.isHealthy(),
  metrics: databaseManager.getMetrics(),
  config: {
    maxConnections: databaseManager.getConfig().maxConnections,
    queryTimeout: databaseManager.getConfig().queryTimeout,
    slowQueryThreshold: databaseManager.getConfig().slowQueryThreshold
  }
});

// Graceful shutdown
export const disconnectDatabase = () => databaseManager.disconnect();

export default databaseManager; 
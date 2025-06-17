/**
 * Advanced Query Optimizer
 * 
 * Intelligent database query optimization med:
 * - Query analysis og performance tracking
 * - Automatic query caching
 * - Slow query detection
 * - Index recommendations
 * - Query plan analysis
 * - Batch query optimization
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import logger from './logger';
// Note: This file provides query optimization without direct cache integration
// Cache integration should be handled at the application layer

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface QueryMetrics {
  query: string;
  executionTime: number;
  timestamp: number;
  params: any[];
  resultCount: number;
  fromCache: boolean;
  error?: string;
}

interface QueryStats {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  topSlowQueries: QueryMetrics[];
  mostFrequentQueries: Array<{
    query: string;
    count: number;
    averageTime: number;
  }>;
}

interface QueryPlan {
  query: string;
  estimatedCost: number;
  actualCost?: number;
  indexesUsed: string[];
  recommendations: string[];
  canCache: boolean;
  suggestedTTL: number;
  tags: string[];
}

interface BatchQuery {
  query: string;
  params: any[];
  cacheKey?: string;
  cacheTTL?: number;
  tags?: string[];
}

interface OptimizationRule {
  name: string;
  pattern: RegExp;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  autoFix?: (query: string) => string;
}

// ============================================================================
// QUERY ANALYZER
// ============================================================================

class QueryAnalyzer {
  private static readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private static readonly CACHE_TTL_RULES = new Map([
    ['SELECT.*FROM.*bruker', 300], // User data - 5 minutes
    ['SELECT.*FROM.*selskap', 600], // Company data - 10 minutes
    ['SELECT.*FROM.*systemconfig', 3600], // System config - 1 hour
    ['SELECT.*FROM.*referanse', 1800], // Reference data - 30 minutes
    ['SELECT.*COUNT.*FROM', 180], // Count queries - 3 minutes
    ['SELECT.*WHERE.*id.*=', 600], // Single record by ID - 10 minutes
  ]);

  static analyzeQuery(query: string, params: any[] = []): QueryPlan {
    const normalizedQuery = query.toLowerCase().trim();
    const plan: QueryPlan = {
      query,
      estimatedCost: this.estimateQueryCost(normalizedQuery),
      indexesUsed: this.detectIndexUsage(normalizedQuery),
      recommendations: [],
      canCache: this.canCacheQuery(normalizedQuery),
      suggestedTTL: this.suggestCacheTTL(normalizedQuery),
      tags: this.extractCacheTags(normalizedQuery)
    };

    // Add recommendations
    plan.recommendations = this.generateRecommendations(normalizedQuery, plan);

    return plan;
  }

  private static estimateQueryCost(query: string): number {
    let cost = 1;

    // Base cost factors
    if (query.includes('join')) cost *= 2;
    if (query.includes('left join') || query.includes('right join')) cost *= 1.5;
    if (query.includes('group by')) cost *= 1.8;
    if (query.includes('order by')) cost *= 1.3;
    if (query.includes('distinct')) cost *= 1.5;
    if (query.includes('like')) cost *= 2;
    if (query.includes('not in')) cost *= 3;
    if (query.includes('exists')) cost *= 2.5;

    // Subquery penalty
    const subqueryCount = (query.match(/\(/g) || []).length;
    cost *= Math.pow(1.5, subqueryCount);

    // Table scan indicators
    if (!query.includes('where') && query.includes('select')) cost *= 5;
    if (query.includes('select *')) cost *= 1.2;

    return Math.round(cost * 10) / 10;
  }

  private static detectIndexUsage(query: string): string[] {
    const indexes: string[] = [];

    // Common index patterns
    if (query.includes('where id =')) indexes.push('PRIMARY');
    if (query.includes('where epost =')) indexes.push('idx_bruker_epost');
    if (query.includes('where selskap_id =')) indexes.push('idx_selskap_id');
    if (query.includes('where opprettet_dato')) indexes.push('idx_opprettet_dato');
    if (query.includes('where status =')) indexes.push('idx_status');

    return indexes;
  }

  private static canCacheQuery(query: string): boolean {
    // Don't cache mutations
    if (/^(insert|update|delete|create|drop|alter)/i.test(query)) {
      return false;
    }

    // Don't cache queries with functions that return different results
    if (query.includes('now()') || query.includes('current_timestamp') || 
        query.includes('rand()') || query.includes('uuid()')) {
      return false;
    }

    // Don't cache user-specific queries without proper tagging
    if (query.includes('session') || query.includes('token')) {
      return false;
    }

    return true;
  }

  private static suggestCacheTTL(query: string): number {
    for (const [pattern, ttl] of this.CACHE_TTL_RULES) {
      if (new RegExp(pattern, 'i').test(query)) {
        return ttl;
      }
    }

    // Default TTL based on query type
    if (query.includes('count')) return 180; // 3 minutes
    if (query.includes('sum') || query.includes('avg')) return 300; // 5 minutes
    if (query.includes('join')) return 600; // 10 minutes
    
    return 300; // Default 5 minutes
  }

  private static extractCacheTags(query: string): string[] {
    const tags: string[] = [];

    // Extract table names as tags
    const tableMatches = query.match(/from\s+(\w+)/gi);
    if (tableMatches) {
      tableMatches.forEach(match => {
        const table = match.replace(/from\s+/i, '').toLowerCase();
        tags.push(`table:${table}`);
      });
    }

    // Add operation tags
    if (query.includes('join')) tags.push('operation:join');
    if (query.includes('group by')) tags.push('operation:aggregate');
    if (query.includes('order by')) tags.push('operation:sort');

    return tags;
  }

  private static generateRecommendations(query: string, plan: QueryPlan): string[] {
    const recommendations: string[] = [];

    // High cost query recommendations
    if (plan.estimatedCost > 10) {
      recommendations.push('Query har høy estimert kostnad - vurder optimalisering');
    }

    // Missing WHERE clause
    if (!query.includes('where') && query.includes('select')) {
      recommendations.push('Mangler WHERE-klausul - kan resultere i full table scan');
    }

    // SELECT * usage
    if (query.includes('select *')) {
      recommendations.push('Unngå SELECT * - spesifiser kun nødvendige kolonner');
    }

    // N+1 query pattern
    if (query.includes('where id in')) {
      recommendations.push('Mulig N+1 query pattern - vurder JOIN i stedet');
    }

    // Missing indexes
    if (query.includes('like') && !query.includes('like \'%')) {
      recommendations.push('LIKE-søk uten wildcard kan dra nytte av indeks');
    }

    // Caching recommendations
    if (plan.canCache && plan.estimatedCost > 5) {
      recommendations.push(`Query kan caches med TTL ${plan.suggestedTTL} sekunder`);
    }

    return recommendations;
  }
}

// ============================================================================
// QUERY PERFORMANCE TRACKER
// ============================================================================

class QueryPerformanceTracker {
  private static metrics: QueryMetrics[] = [];
  private static readonly MAX_METRICS = 1000;
  private static queryFrequency = new Map<string, number>();

  static recordQuery(metrics: QueryMetrics): void {
    // Add to metrics array
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Update frequency counter
    const queryHash = this.hashQuery(metrics.query);
    this.queryFrequency.set(queryHash, (this.queryFrequency.get(queryHash) || 0) + 1);

    // Log slow queries
    if (metrics.executionTime > QueryAnalyzer['SLOW_QUERY_THRESHOLD']) {
      logger.warn('Slow query detected', {
        query: metrics.query.substring(0, 200),
        executionTime: metrics.executionTime,
        params: metrics.params,
        resultCount: metrics.resultCount
      });
    }

    // Log errors
    if (metrics.error) {
      logger.error('Query error', {
        query: metrics.query.substring(0, 200),
        error: metrics.error,
        params: metrics.params
      });
    }
  }

  static getStats(): QueryStats {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 3600000); // Last hour

    const totalQueries = recentMetrics.length;
    const averageExecutionTime = totalQueries > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries 
      : 0;

    const slowQueries = recentMetrics.filter(m => 
      m.executionTime > QueryAnalyzer['SLOW_QUERY_THRESHOLD']
    ).length;

    const cacheHits = recentMetrics.filter(m => m.fromCache).length;
    const cacheMisses = totalQueries - cacheHits;
    const errors = recentMetrics.filter(m => m.error).length;

    // Top slow queries
    const topSlowQueries = [...recentMetrics]
      .filter(m => m.executionTime > 100) // Only queries > 100ms
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // Most frequent queries
    const queryStats = new Map<string, { count: number; totalTime: number }>();
    
    recentMetrics.forEach(m => {
      const hash = this.hashQuery(m.query);
      const existing = queryStats.get(hash) || { count: 0, totalTime: 0 };
      queryStats.set(hash, {
        count: existing.count + 1,
        totalTime: existing.totalTime + m.executionTime
      });
    });

    const mostFrequentQueries = Array.from(queryStats.entries())
      .map(([hash, stats]) => {
        const sampleMetric = recentMetrics.find(m => this.hashQuery(m.query) === hash);
        return {
          query: sampleMetric?.query.substring(0, 100) + '...' || 'Unknown',
          count: stats.count,
          averageTime: Math.round(stats.totalTime / stats.count)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalQueries,
      averageExecutionTime: Math.round(averageExecutionTime),
      slowQueries,
      cacheHits,
      cacheMisses,
      errors,
      topSlowQueries,
      mostFrequentQueries
    };
  }

  static clearMetrics(): void {
    this.metrics = [];
    this.queryFrequency.clear();
  }

  private static hashQuery(query: string): string {
    // Normalize query for hashing (remove params, whitespace, etc.)
    const normalized = query
      .replace(/\$\d+/g, '?') // Replace $1, $2, etc. with ?
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase()
      .trim();
    
    return createHash('md5').update(normalized).digest('hex');
  }
}

// ============================================================================
// QUERY OPTIMIZER
// ============================================================================

class QueryOptimizer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async executeOptimizedQuery<T>(
    query: string,
    params: any[] = [],
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      tags?: string[];
      timeout?: number;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const plan = QueryAnalyzer.analyzeQuery(query, params);
    
    let result: T | undefined;
    let fromCache = false;
    let error: string | undefined;

    try {
      // Cache integration would be handled at application layer
      // This is a simplified version without direct cache integration

      // Execute query if not cached
      if (!fromCache) {
        // Set query timeout if specified
        if (options.timeout) {
          // Note: Prisma doesn't have built-in timeout, this would need to be implemented
          // with Promise.race and setTimeout
        }

        result = await this.executeRawQuery<T>(query, params);

        // Cache result would be handled at application layer
      }

      // Record metrics
      QueryPerformanceTracker.recordQuery({
        query,
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
        params,
        resultCount: Array.isArray(result) ? result.length : 1,
        fromCache,
        error
      });

      if (result === undefined) {
        throw new Error('Query returned undefined result');
      }

      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      
      QueryPerformanceTracker.recordQuery({
        query,
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
        params,
        resultCount: 0,
        fromCache: false,
        error
      });

      throw err;
    }
  }

  async executeBatchQueries(queries: BatchQuery[]): Promise<any[]> {
    const startTime = Date.now();
    const results: any[] = [];

    try {
      // Group queries by cache status
      const cachedQueries: Array<{ index: number; result: any }> = [];
      const uncachedQueries: Array<{ index: number; query: BatchQuery }> = [];

      // Check cache for each query
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        
        // Cache checking would be handled at application layer
        // For now, treat all queries as uncached
        
        uncachedQueries.push({ index: i, query });
      }

      // Execute uncached queries in parallel (with limit)
      const BATCH_SIZE = 5;
      for (let i = 0; i < uncachedQueries.length; i += BATCH_SIZE) {
        const batch = uncachedQueries.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async ({ index, query }) => {
          try {
            const result = await this.executeRawQuery(query.query, query.params);
            
            // Cache result would be handled at application layer
            
            return { index, result };
          } catch (error) {
            logger.error('Batch query error', {
              query: query.query.substring(0, 100),
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            return { index, result: null, error };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ index, result }) => {
          results[index] = result;
        });
      }

      // Add cached results
      cachedQueries.forEach(({ index, result }) => {
        results[index] = result;
      });

      logger.info('Batch queries executed', {
        totalQueries: queries.length,
        cachedQueries: cachedQueries.length,
        uncachedQueries: uncachedQueries.length,
        executionTime: Date.now() - startTime
      });

      return results;
    } catch (error) {
      logger.error('Batch query execution failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        queryCount: queries.length
      });
      throw error;
    }
  }

  async analyzeQueryPerformance(query: string, params: any[] = []): Promise<{
    plan: QueryPlan;
    executionTime: number;
    result: any;
    recommendations: string[];
  }> {
    const startTime = Date.now();
    const plan = QueryAnalyzer.analyzeQuery(query, params);
    
    try {
      const result = await this.executeRawQuery(query, params);
      const executionTime = Date.now() - startTime;
      
      // Update plan with actual metrics
      plan.actualCost = executionTime;
      
      // Generate performance-based recommendations
      const recommendations = [...plan.recommendations];
      
      if (executionTime > 1000) {
        recommendations.push('Query tar over 1 sekund - kritisk optimalisering nødvendig');
      } else if (executionTime > 500) {
        recommendations.push('Query tar over 500ms - optimalisering anbefalt');
      }

      if (Array.isArray(result) && result.length > 1000) {
        recommendations.push('Query returnerer mange rader - vurder paginering');
      }

      return {
        plan,
        executionTime,
        result,
        recommendations
      };
    } catch (error) {
      throw error;
    }
  }

  getPerformanceStats(): QueryStats {
    return QueryPerformanceTracker.getStats();
  }

  clearPerformanceData(): void {
    QueryPerformanceTracker.clearMetrics();
  }

  private async executeRawQuery<T>(query: string, params: any[] = []): Promise<T> {
    // This is a simplified implementation
    // In a real scenario, you'd use Prisma's raw query methods
    return await (this.prisma as any).$queryRaw`${query}` as T;
  }

  private generateCacheKey(query: string, params: any[]): string {
    const combined = query + JSON.stringify(params);
    return createHash('sha256').update(combined).digest('hex');
  }
}

// ============================================================================
// OPTIMIZATION RULES ENGINE
// ============================================================================

class OptimizationRulesEngine {
  private static readonly rules: OptimizationRule[] = [
    {
      name: 'Avoid SELECT *',
      pattern: /select\s+\*/i,
      recommendation: 'Spesifiser kun nødvendige kolonner i stedet for SELECT *',
      severity: 'medium',
      autoFix: (query) => {
        // This would need table schema information to implement properly
        return query;
      }
    },
    {
      name: 'Missing WHERE clause',
      pattern: /select\s+.*\s+from\s+\w+(?!\s+where)/i,
      recommendation: 'Legg til WHERE-klausul for å begrense resultatet',
      severity: 'high'
    },
    {
      name: 'Inefficient LIKE usage',
      pattern: /like\s+'%.*%'/i,
      recommendation: 'LIKE med wildcards på begge sider kan ikke bruke indeks',
      severity: 'medium'
    },
    {
      name: 'NOT IN usage',
      pattern: /not\s+in\s*\(/i,
      recommendation: 'NOT IN kan være ineffektivt - vurder LEFT JOIN med NULL check',
      severity: 'medium'
    },
    {
      name: 'Subquery in WHERE',
      pattern: /where\s+.*\s+in\s*\(\s*select/i,
      recommendation: 'Subquery i WHERE kan ofte erstattes med JOIN',
      severity: 'low'
    }
  ];

  static analyzeQuery(query: string): Array<{
    rule: string;
    recommendation: string;
    severity: 'low' | 'medium' | 'high';
    canAutoFix: boolean;
  }> {
    const issues: Array<{
      rule: string;
      recommendation: string;
      severity: 'low' | 'medium' | 'high';
      canAutoFix: boolean;
    }> = [];

    this.rules.forEach(rule => {
      if (rule.pattern.test(query)) {
        issues.push({
          rule: rule.name,
          recommendation: rule.recommendation,
          severity: rule.severity,
          canAutoFix: !!rule.autoFix
        });
      }
    });

    return issues;
  }

  static autoFixQuery(query: string): {
    fixedQuery: string;
    appliedFixes: string[];
  } {
    let fixedQuery = query;
    const appliedFixes: string[] = [];

    this.rules.forEach(rule => {
      if (rule.autoFix && rule.pattern.test(fixedQuery)) {
        const newQuery = rule.autoFix(fixedQuery);
        if (newQuery !== fixedQuery) {
          fixedQuery = newQuery;
          appliedFixes.push(rule.name);
        }
      }
    });

    return {
      fixedQuery,
      appliedFixes
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  QueryOptimizer,
  QueryAnalyzer,
  QueryPerformanceTracker,
  OptimizationRulesEngine,
  type QueryMetrics,
  type QueryStats,
  type QueryPlan,
  type BatchQuery
};

export default QueryOptimizer; 
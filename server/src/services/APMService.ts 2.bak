/**
 * Application Performance Monitoring (APM) Service
 * 
 * Comprehensive monitoring løsning for real-time performance tracking,
 * alerting og automatisk diagnostikk av performance problemer
 */

import EventEmitter from 'events';
import logger from '../utils/logger';
import cacheService from './cache.service';

interface APMMetrics {
  timestamp: Date;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  apdex: number; // Application Performance Index
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  activeConnections: number;
  queueLength: number;
}

interface TransactionData {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'completed' | 'failed';
  endpoint: string;
  method: string;
  userId?: string;
  errors?: Error[];
  customMetrics?: Record<string, any>;
}

interface PerformanceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  resolved: boolean;
}

class APMService extends EventEmitter {
  private metrics: APMMetrics[] = [];
  private activeTransactions = new Map<string, TransactionData>();
  private alerts: PerformanceAlert[] = [];
  private metricsInterval?: NodeJS.Timeout;

  // Performance thresholds
  private readonly thresholds = {
    responseTime: 2000, // ms
    errorRate: 5, // %
    memoryUsage: 80, // % of available
    cpuUsage: 85, // %
    apdexThreshold: 0.7, // below this is concerning
    requestsPerSecond: 1000 // max RPS before alerting
  };

  constructor() {
    super();
    this.startMetricsCollection();
    this.setupEventListeners();
  }

  /**
   * Start a new transaction for tracking
   */
  startTransaction(name: string, endpoint: string, method: string, userId?: string): string {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: TransactionData = {
      id: transactionId,
      name,
      endpoint,
      method,
      userId,
      startTime: Date.now(),
      status: 'pending'
    };

    this.activeTransactions.set(transactionId, transaction);
    return transactionId;
  }

  /**
   * End a transaction and calculate metrics
   */
  endTransaction(transactionId: string, success: boolean = true, error?: Error): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (!transaction) return;

    const endTime = Date.now();
    const duration = endTime - transaction.startTime;

    transaction.endTime = endTime;
    transaction.duration = duration;
    transaction.status = success ? 'completed' : 'failed';
    
    if (error) {
      transaction.errors = transaction.errors || [];
      transaction.errors.push(error);
    }

    // Store completed transaction for analysis
    this.storeTransaction(transaction);

    // Check for performance issues
    this.analyzeTransaction(transaction);

    // Cleanup active transaction
    this.activeTransactions.delete(transactionId);
  }

  /**
   * Add custom metrics to a transaction
   */
  addTransactionMetric(transactionId: string, key: string, value: any): void {
    const transaction = this.activeTransactions.get(transactionId);
    if (transaction) {
      transaction.customMetrics = transaction.customMetrics || {};
      transaction.customMetrics[key] = value;
    }
  }

  /**
   * Start periodic metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 10000); // Every 10 seconds

    // Also collect initial metrics
    this.collectMetrics();
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const now = new Date();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = await this.getCPUUsage();

      // Calculate request metrics from recent transactions
      const recentTransactions = await this.getRecentTransactions(60000); // Last minute
      const completedTransactions = recentTransactions.filter(t => t.status === 'completed');
      const failedTransactions = recentTransactions.filter(t => t.status === 'failed');

      const requestsPerSecond = recentTransactions.length / 60;
      const averageResponseTime = completedTransactions.length > 0
        ? completedTransactions.reduce((sum, t) => sum + (t.duration || 0), 0) / completedTransactions.length
        : 0;
      const errorRate = recentTransactions.length > 0
        ? (failedTransactions.length / recentTransactions.length) * 100
        : 0;

      // Calculate Apdex score (satisfying + tolerating/2) / total
      const satisfying = completedTransactions.filter(t => (t.duration || 0) <= 1000).length;
      const tolerating = completedTransactions.filter(t => (t.duration || 0) > 1000 && (t.duration || 0) <= 4000).length;
      const apdex = completedTransactions.length > 0
        ? (satisfying + tolerating / 2) / completedTransactions.length
        : 1;

      const metrics: APMMetrics = {
        timestamp: now,
        requestsPerSecond,
        averageResponseTime,
        errorRate,
        throughput: requestsPerSecond * 1000, // requests per second to ms
        apdex,
        memoryUsage,
        cpuUsage,
        activeConnections: this.activeTransactions.size,
        queueLength: await this.getQueueLength()
      };

      // Store metrics
      this.metrics.push(metrics);
      
      // Keep only last 24 hours of metrics (8640 entries at 10s intervals)
      if (this.metrics.length > 8640) {
        this.metrics = this.metrics.slice(-8640);
      }

      // Cache current metrics for dashboard
      await cacheService.set('apm:current_metrics', metrics, 15);

      // Check for alerts
      this.checkAlerts(metrics);

      // Emit metrics for real-time updates
      this.emit('metrics', metrics);

    } catch (error) {
      logger.error('Failed to collect APM metrics', error);
    }
  }

  /**
   * Get CPU usage percentage
   */
  private getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        const duration = (endTime - startTime) * 1000; // Convert to microseconds

        const userPercent = (endUsage.user / duration) * 100;
        const systemPercent = (endUsage.system / duration) * 100;
        
        resolve(userPercent + systemPercent);
      }, 100);
    });
  }

  /**
   * Get queue length from cache or database
   */
  private async getQueueLength(): Promise<number> {
    try {
      // This would typically check job queues, database connections, etc.
      return 0; // Placeholder
    } catch {
      return 0;
    }
  }

  /**
   * Store completed transaction for analysis
   */
  private async storeTransaction(transaction: TransactionData): Promise<void> {
    try {
      const key = `apm:transactions:${new Date().toISOString().split('T')[0]}`;
      const transactions = await cacheService.get(key) || [];
      
      transactions.push(transaction);
      
      // Keep only last 1000 transactions per day
      if (transactions.length > 1000) {
        transactions.shift();
      }
      
      await cacheService.set(key, transactions, 86400); // 24 hours
    } catch (error) {
      logger.error('Failed to store transaction data', error);
    }
  }

  /**
   * Get recent transactions for analysis
   */
  private async getRecentTransactions(milliseconds: number): Promise<TransactionData[]> {
    try {
      const key = `apm:transactions:${new Date().toISOString().split('T')[0]}`;
      const transactions = await cacheService.get(key) || [];
      
      const cutoff = Date.now() - milliseconds;
      return transactions.filter((t: TransactionData) => t.startTime >= cutoff);
    } catch {
      return [];
    }
  }

  /**
   * Analyze transaction for performance issues
   */
  private analyzeTransaction(transaction: TransactionData): void {
    if (!transaction.duration) return;

    // Check for slow transactions
    if (transaction.duration > this.thresholds.responseTime) {
      logger.warn('Slow transaction detected', {
        transactionId: transaction.id,
        endpoint: transaction.endpoint,
        duration: transaction.duration,
        threshold: this.thresholds.responseTime
      });

      this.createAlert('warning', 'Slow transaction detected', 'response_time', 
        transaction.duration, this.thresholds.responseTime);
    }

    // Check for database queries in custom metrics
    if (transaction.customMetrics?.dbQueries) {
      const slowQueries = transaction.customMetrics.dbQueries.filter(
        (query: any) => query.duration > 1000
      );

      if (slowQueries.length > 0) {
        logger.warn('Slow database queries detected', {
          transactionId: transaction.id,
          slowQueries: slowQueries.length,
          queries: slowQueries
        });
      }
    }
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metrics: APMMetrics): void {
    // High response time
    if (metrics.averageResponseTime > this.thresholds.responseTime) {
      this.createAlert('critical', 'High average response time', 'response_time',
        metrics.averageResponseTime, this.thresholds.responseTime);
    }

    // High error rate
    if (metrics.errorRate > this.thresholds.errorRate) {
      this.createAlert('critical', 'High error rate', 'error_rate',
        metrics.errorRate, this.thresholds.errorRate);
    }

    // High memory usage
    const memoryPercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
    if (memoryPercent > this.thresholds.memoryUsage) {
      this.createAlert('warning', 'High memory usage', 'memory_usage',
        memoryPercent, this.thresholds.memoryUsage);
    }

    // Low Apdex score
    if (metrics.apdex < this.thresholds.apdexThreshold) {
      this.createAlert('warning', 'Poor application performance (low Apdex)', 'apdex',
        metrics.apdex, this.thresholds.apdexThreshold);
    }

    // High request rate
    if (metrics.requestsPerSecond > this.thresholds.requestsPerSecond) {
      this.createAlert('warning', 'High request rate', 'requests_per_second',
        metrics.requestsPerSecond, this.thresholds.requestsPerSecond);
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(type: 'critical' | 'warning' | 'info', message: string, 
                     metric: string, value: number, threshold: number): void {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const alert: PerformanceAlert = {
      id: alertId,
      type,
      message,
      timestamp: new Date(),
      metric,
      value,
      threshold,
      resolved: false
    };

    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log alert
    logger.warn('Performance alert created', alert);

    // Emit alert for real-time notifications
    this.emit('alert', alert);
  }

  /**
   * Setup event listeners for automatic performance tracking
   */
  private setupEventListeners(): void {
    // Listen for uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception detected', error);
      this.createAlert('critical', 'Uncaught exception', 'exceptions', 1, 0);
    });

    // Listen for unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection', reason);
      this.createAlert('critical', 'Unhandled promise rejection', 'promises', 1, 0);
    });
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): APMMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics for a time range
   */
  getMetrics(startTime: Date, endTime: Date): APMMetrics[] {
    return this.metrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger.info('Performance alert resolved', { alertId });
      return true;
    }
    return false;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): any {
    const currentMetrics = this.getCurrentMetrics();
    const last24h = this.getMetrics(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      new Date()
    );

    if (!currentMetrics || last24h.length === 0) {
      return null;
    }

    const avgResponseTime = last24h.reduce((sum, m) => sum + m.averageResponseTime, 0) / last24h.length;
    const avgErrorRate = last24h.reduce((sum, m) => sum + m.errorRate, 0) / last24h.length;
    const avgApdex = last24h.reduce((sum, m) => sum + m.apdex, 0) / last24h.length;

    return {
      current: currentMetrics,
      last24h: {
        averageResponseTime: avgResponseTime,
        averageErrorRate: avgErrorRate,
        averageApdex: avgApdex,
        dataPoints: last24h.length
      },
      alerts: {
        active: this.getActiveAlerts().length,
        total: this.alerts.length
      },
      recommendations: this.generateRecommendations(currentMetrics, last24h)
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(current: APMMetrics, historical: APMMetrics[]): string[] {
    const recommendations: string[] = [];

    if (current.averageResponseTime > 1000) {
      recommendations.push('Vurder å implementere caching for å redusere responstider');
    }

    if (current.errorRate > 2) {
      recommendations.push('Høy feilrate detektert - sjekk logger for årsaker');
    }

    if (current.apdex < 0.8) {
      recommendations.push('Lav Apdex score - optimaliser kritiske endepunkter');
    }

    const memoryPercent = (current.memoryUsage.heapUsed / current.memoryUsage.heapTotal) * 100;
    if (memoryPercent > 70) {
      recommendations.push('Høy minnebruk - vurder memory leaks eller optimaliser data håndtering');
    }

    if (current.requestsPerSecond > 500) {
      recommendations.push('Høy trafikk - vurder horisontal skalering eller load balancing');
    }

    return recommendations;
  }

  /**
   * Cleanup and stop monitoring
   */
  cleanup(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.removeAllListeners();
  }
}

export { APMService, APMMetrics, TransactionData, PerformanceAlert }; 
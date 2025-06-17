import { ServiceMetrics } from '../scaling/PredictiveScaler';

export interface ScalingEvent {
  service: string;
  action: 'scale_up' | 'scale_down';
  fromReplicas: number;
  toReplicas: number;
  reason: string;
  timestamp: Date;
  automated: boolean;
}

export class MetricsCollector {
  private scalingHistory: ScalingEvent[] = [];
  private services = [
    'api-gateway',
    'auth-service', 
    'user-service',
    'quiz-service',
    'sikkerhetskontroll-service',
    'hr-service',
    'economy-service',
    'graphql-service',
    'notification-service',
    'ml-service',
    'observability-service'
  ];

  constructor() {
    console.log('📊 Metrics Collector initialized');
  }

  async getCurrentMetrics(service: string): Promise<ServiceMetrics> {
    // Simulate fetching metrics from Prometheus/Kubernetes
    // In production, this would make actual API calls
    
    const baseMetrics = {
      'api-gateway': { cpu: 45, memory: 60, requests: 1200, replicas: 3 },
      'auth-service': { cpu: 30, memory: 40, requests: 800, replicas: 2 },
      'user-service': { cpu: 35, memory: 45, requests: 600, replicas: 2 },
      'quiz-service': { cpu: 50, memory: 55, requests: 400, replicas: 2 },
      'sikkerhetskontroll-service': { cpu: 40, memory: 50, requests: 300, replicas: 2 },
      'hr-service': { cpu: 25, memory: 35, requests: 200, replicas: 1 },
      'economy-service': { cpu: 30, memory: 40, requests: 250, replicas: 1 },
      'graphql-service': { cpu: 55, memory: 65, requests: 900, replicas: 3 },
      'notification-service': { cpu: 20, memory: 30, requests: 500, replicas: 1 },
      'ml-service': { cpu: 70, memory: 80, requests: 150, replicas: 2 },
      'observability-service': { cpu: 35, memory: 45, requests: 300, replicas: 1 }
    };

    const base = baseMetrics[service] || { cpu: 30, memory: 40, requests: 100, replicas: 1 };
    
    // Add some randomness to simulate real metrics
    const variance = 0.2; // 20% variance
    
    return {
      cpu: Math.max(0, Math.min(100, base.cpu + (Math.random() - 0.5) * variance * base.cpu)),
      memory: Math.max(0, Math.min(100, base.memory + (Math.random() - 0.5) * variance * base.memory)),
      requests: Math.max(0, base.requests + (Math.random() - 0.5) * variance * base.requests),
      replicas: base.replicas,
      responseTime: 100 + Math.random() * 200, // 100-300ms
      errorRate: Math.random() * 0.05, // 0-5% error rate
      timestamp: new Date()
    };
  }

  async getAllServices(): Promise<string[]> {
    return [...this.services];
  }

  async recordScalingEvent(event: ScalingEvent): Promise<void> {
    this.scalingHistory.push(event);
    
    // Keep only last 1000 events
    if (this.scalingHistory.length > 1000) {
      this.scalingHistory.shift();
    }
    
    console.log(`📝 Recorded scaling event: ${event.service} ${event.action} ${event.fromReplicas}→${event.toReplicas} (${event.reason})`);
  }

  async getScalingHistory(options: {
    service?: string;
    limit: number;
    timeRange: string;
  }): Promise<ScalingEvent[]> {
    let history = [...this.scalingHistory];
    
    // Filter by service
    if (options.service) {
      history = history.filter(event => event.service === options.service);
    }
    
    // Filter by time range
    const timeRangeMs = this.parseTimeRange(options.timeRange);
    const cutoff = new Date(Date.now() - timeRangeMs);
    history = history.filter(event => event.timestamp >= cutoff);
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return history.slice(0, options.limit);
  }

  async getLastScalingEvent(service: string): Promise<ScalingEvent | null> {
    const serviceEvents = this.scalingHistory
      .filter(event => event.service === service)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return serviceEvents[0] || null;
  }

  async getPerformanceMetrics(service: string, timeRange: string): Promise<{
    averageResponseTime: number;
    averageErrorRate: number;
    averageCpu: number;
    averageMemory: number;
    totalRequests: number;
  }> {
    // Simulate performance metrics calculation
    // In production, this would query actual metrics storage
    
    return {
      averageResponseTime: 150 + Math.random() * 100,
      averageErrorRate: Math.random() * 0.03,
      averageCpu: 40 + Math.random() * 20,
      averageMemory: 50 + Math.random() * 20,
      totalRequests: 1000 + Math.random() * 2000
    };
  }

  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)([smhd])$/);
    if (!match) return 3600000; // Default 1 hour
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 3600000;
    }
  }

  // Simulate Prometheus query
  async queryPrometheus(query: string): Promise<any> {
    console.log(`📊 Prometheus query: ${query}`);
    
    // Mock response
    return {
      status: 'success',
      data: {
        resultType: 'vector',
        result: [
          {
            metric: { __name__: 'cpu_usage', service: 'api-gateway' },
            value: [Date.now() / 1000, '45.5']
          }
        ]
      }
    };
  }

  // Simulate Kubernetes API call
  async queryKubernetes(resource: string, namespace: string = 'tms-system'): Promise<any> {
    console.log(`☸️ Kubernetes query: ${resource} in ${namespace}`);
    
    // Mock response
    return {
      kind: 'DeploymentList',
      items: [
        {
          metadata: { name: 'api-gateway' },
          spec: { replicas: 3 },
          status: { readyReplicas: 3 }
        }
      ]
    };
  }
} 
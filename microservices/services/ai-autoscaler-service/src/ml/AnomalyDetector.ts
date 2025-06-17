export interface Anomaly {
  id: string;
  type: 'performance_degradation' | 'resource_spike' | 'error_rate_increase' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  confidence: number;
  affectedMetrics: string[];
  suggestedActions: string[];
}

export class AnomalyDetector {
  private baselineData: Map<string, any> = new Map();

  constructor() {
    console.log('🔍 Anomaly Detector initialized');
  }

  async detectAnomalies(service: string, timeRange: string): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Simulate anomaly detection
    const anomalyChance = 0.15; // 15% chance of detecting anomalies
    
    if (Math.random() < anomalyChance) {
      const anomalyTypes = [
        'performance_degradation',
        'resource_spike', 
        'error_rate_increase',
        'unusual_pattern'
      ] as const;
      
      const type = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
      const severity = this.generateSeverity();
      
      anomalies.push({
        id: this.generateAnomalyId(),
        type,
        severity,
        description: this.generateDescription(type, severity),
        timestamp: new Date(),
        confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
        affectedMetrics: this.getAffectedMetrics(type),
        suggestedActions: this.getSuggestedActions(type, severity)
      });
    }
    
    return anomalies;
  }

  private generateSeverity(): 'low' | 'medium' | 'high' {
    const rand = Math.random();
    if (rand < 0.6) return 'low';
    if (rand < 0.85) return 'medium';
    return 'high';
  }

  private generateDescription(type: string, severity: string): string {
    const descriptions = {
      performance_degradation: {
        low: 'Slight increase in response times detected',
        medium: 'Noticeable performance degradation observed',
        high: 'Severe performance degradation affecting user experience'
      },
      resource_spike: {
        low: 'Minor resource usage spike detected',
        medium: 'Significant resource consumption increase',
        high: 'Critical resource spike - potential service disruption'
      },
      error_rate_increase: {
        low: 'Small increase in error rate observed',
        medium: 'Notable increase in service errors',
        high: 'Critical error rate spike - immediate attention required'
      },
      unusual_pattern: {
        low: 'Unusual traffic pattern detected',
        medium: 'Significant deviation from normal behavior',
        high: 'Highly unusual pattern - potential security concern'
      }
    };
    
    return descriptions[type]?.[severity] || 'Anomaly detected';
  }

  private getAffectedMetrics(type: string): string[] {
    const metricMap = {
      performance_degradation: ['response_time', 'throughput', 'cpu_usage'],
      resource_spike: ['cpu_usage', 'memory_usage', 'disk_io'],
      error_rate_increase: ['error_rate', 'http_5xx', 'failed_requests'],
      unusual_pattern: ['request_pattern', 'user_behavior', 'traffic_volume']
    };
    
    return metricMap[type] || ['unknown'];
  }

  private getSuggestedActions(type: string, severity: string): string[] {
    const actionMap = {
      performance_degradation: {
        low: ['Monitor closely', 'Check for resource constraints'],
        medium: ['Scale up resources', 'Investigate bottlenecks'],
        high: ['Immediate scaling', 'Emergency response', 'Alert on-call team']
      },
      resource_spike: {
        low: ['Monitor resource usage', 'Check for memory leaks'],
        medium: ['Scale resources', 'Investigate root cause'],
        high: ['Emergency scaling', 'Kill problematic processes', 'Alert team']
      },
      error_rate_increase: {
        low: ['Check logs', 'Monitor error patterns'],
        medium: ['Investigate errors', 'Check dependencies'],
        high: ['Emergency response', 'Rollback if needed', 'Alert team']
      },
      unusual_pattern: {
        low: ['Monitor pattern', 'Check for legitimate changes'],
        medium: ['Investigate source', 'Check security logs'],
        high: ['Security alert', 'Block suspicious traffic', 'Emergency response']
      }
    };
    
    return actionMap[type]?.[severity] || ['Investigate anomaly'];
  }

  private generateAnomalyId(): string {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update baseline data for better anomaly detection
  updateBaseline(service: string, metrics: any): void {
    this.baselineData.set(service, {
      ...metrics,
      lastUpdated: new Date()
    });
  }

  getBaseline(service: string): any {
    return this.baselineData.get(service);
  }
} 
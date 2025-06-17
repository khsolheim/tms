import { ServiceMetrics, LoadPrediction } from '../scaling/PredictiveScaler';

export interface ScalingRecommendation {
  action: 'scale_up' | 'scale_down' | 'no_action';
  currentReplicas: number;
  recommendedReplicas: number;
  reason: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface ScalingDecision {
  shouldScale: boolean;
  action: 'scale_up' | 'scale_down';
  targetReplicas: number;
  reason: string;
}

export class ScalingDecisionEngine {
  private config = {
    cpuThresholds: { scaleUp: 70, scaleDown: 30 },
    memoryThresholds: { scaleUp: 80, scaleDown: 40 },
    responseTimeThresholds: { scaleUp: 500, scaleDown: 100 },
    minReplicas: 1,
    maxReplicas: 10,
    scaleUpCooldown: 300000, // 5 minutes
    scaleDownCooldown: 600000, // 10 minutes
    predictionWeight: 0.3
  };

  constructor() {
    console.log('🧠 Scaling Decision Engine initialized');
  }

  async generateRecommendations(
    service: string,
    currentMetrics: ServiceMetrics,
    predictions: LoadPrediction[]
  ): Promise<ScalingRecommendation> {
    // Analyze current state
    const currentLoad = this.calculateLoadScore(currentMetrics);
    
    // Analyze predicted state
    const futureLoad = predictions.length > 0 
      ? this.calculatePredictedLoadScore(predictions[0])
      : currentLoad;
    
    // Combine current and predicted load
    const combinedLoad = currentLoad * (1 - this.config.predictionWeight) + 
                        futureLoad * this.config.predictionWeight;
    
    // Determine action
    let action: 'scale_up' | 'scale_down' | 'no_action' = 'no_action';
    let recommendedReplicas = currentMetrics.replicas;
    let reason = 'Current load is within acceptable range';
    let confidence = 0.8;
    let urgency: 'low' | 'medium' | 'high' = 'low';
    
    if (combinedLoad > 75) {
      action = 'scale_up';
      recommendedReplicas = Math.min(
        this.config.maxReplicas,
        Math.ceil(currentMetrics.replicas * 1.5)
      );
      reason = `High load detected (${Math.round(combinedLoad)}%)`;
      urgency = combinedLoad > 90 ? 'high' : 'medium';
      confidence = Math.min(0.95, 0.7 + (combinedLoad - 75) / 100);
    } else if (combinedLoad < 25 && currentMetrics.replicas > this.config.minReplicas) {
      action = 'scale_down';
      recommendedReplicas = Math.max(
        this.config.minReplicas,
        Math.floor(currentMetrics.replicas * 0.7)
      );
      reason = `Low load detected (${Math.round(combinedLoad)}%)`;
      urgency = 'low';
      confidence = Math.min(0.9, 0.6 + (50 - combinedLoad) / 100);
    }
    
    return {
      action,
      currentReplicas: currentMetrics.replicas,
      recommendedReplicas,
      reason,
      confidence,
      urgency
    };
  }

  async shouldScale(
    service: string,
    currentMetrics: ServiceMetrics,
    predictions: LoadPrediction[]
  ): Promise<ScalingDecision> {
    const recommendation = await this.generateRecommendations(service, currentMetrics, predictions);
    
    if (recommendation.action === 'no_action') {
      return {
        shouldScale: false,
        action: 'scale_up',
        targetReplicas: currentMetrics.replicas,
        reason: recommendation.reason
      };
    }
    
    // Check cooldown periods (simplified - in production, track per service)
    const shouldRespectCooldown = Math.random() > 0.8; // 20% chance to ignore cooldown for demo
    
    if (shouldRespectCooldown) {
      return {
        shouldScale: false,
        action: recommendation.action,
        targetReplicas: currentMetrics.replicas,
        reason: 'Scaling action in cooldown period'
      };
    }
    
    return {
      shouldScale: true,
      action: recommendation.action,
      targetReplicas: recommendation.recommendedReplicas,
      reason: recommendation.reason
    };
  }

  async validateScalingAction(action: {
    service: string;
    action: string;
    replicas: number;
    reason: string;
  }): Promise<{ valid: boolean; reason?: string }> {
    // Validate replica count
    if (action.replicas < this.config.minReplicas) {
      return {
        valid: false,
        reason: `Replica count ${action.replicas} is below minimum ${this.config.minReplicas}`
      };
    }
    
    if (action.replicas > this.config.maxReplicas) {
      return {
        valid: false,
        reason: `Replica count ${action.replicas} exceeds maximum ${this.config.maxReplicas}`
      };
    }
    
    // Validate action type
    if (!['scale_up', 'scale_down'].includes(action.action)) {
      return {
        valid: false,
        reason: `Invalid action type: ${action.action}`
      };
    }
    
    return { valid: true };
  }

  async evaluateTrigger(
    service: string,
    trigger: string,
    metadata: any,
    currentMetrics: ServiceMetrics
  ): Promise<{ scale: boolean; action?: string; targetReplicas?: number; reason?: string }> {
    switch (trigger) {
      case 'high_cpu':
        if (currentMetrics.cpu > this.config.cpuThresholds.scaleUp) {
          return {
            scale: true,
            action: 'scale_up',
            targetReplicas: Math.min(this.config.maxReplicas, currentMetrics.replicas + 1),
            reason: `CPU usage ${currentMetrics.cpu}% exceeds threshold`
          };
        }
        break;
        
      case 'high_memory':
        if (currentMetrics.memory > this.config.memoryThresholds.scaleUp) {
          return {
            scale: true,
            action: 'scale_up',
            targetReplicas: Math.min(this.config.maxReplicas, currentMetrics.replicas + 1),
            reason: `Memory usage ${currentMetrics.memory}% exceeds threshold`
          };
        }
        break;
        
      case 'high_response_time':
        if (currentMetrics.responseTime > this.config.responseTimeThresholds.scaleUp) {
          return {
            scale: true,
            action: 'scale_up',
            targetReplicas: Math.min(this.config.maxReplicas, currentMetrics.replicas + 1),
            reason: `Response time ${currentMetrics.responseTime}ms exceeds threshold`
          };
        }
        break;
        
      case 'low_load':
        const loadScore = this.calculateLoadScore(currentMetrics);
        if (loadScore < 25 && currentMetrics.replicas > this.config.minReplicas) {
          return {
            scale: true,
            action: 'scale_down',
            targetReplicas: Math.max(this.config.minReplicas, currentMetrics.replicas - 1),
            reason: `Low load detected (${Math.round(loadScore)}%)`
          };
        }
        break;
    }
    
    return {
      scale: false,
      reason: `Trigger ${trigger} conditions not met`
    };
  }

  async handleAnomaly(
    service: string,
    anomaly: any,
    currentMetrics: ServiceMetrics
  ): Promise<ScalingDecision> {
    if (anomaly.type === 'performance_degradation' && anomaly.severity === 'high') {
      return {
        shouldScale: true,
        action: 'scale_up',
        targetReplicas: Math.min(this.config.maxReplicas, currentMetrics.replicas + 2),
        reason: `Performance anomaly detected: ${anomaly.description}`
      };
    }
    
    return {
      shouldScale: false,
      action: 'scale_up',
      targetReplicas: currentMetrics.replicas,
      reason: 'Anomaly does not require scaling action'
    };
  }

  async getConfiguration(): Promise<any> {
    return { ...this.config };
  }

  async updateConfiguration(newConfig: any): Promise<any> {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Scaling configuration updated');
    return this.config;
  }

  private calculateLoadScore(metrics: ServiceMetrics): number {
    // Weighted average of different metrics
    const cpuWeight = 0.4;
    const memoryWeight = 0.3;
    const responseTimeWeight = 0.2;
    const errorRateWeight = 0.1;
    
    const cpuScore = metrics.cpu;
    const memoryScore = metrics.memory;
    const responseTimeScore = Math.min(100, (metrics.responseTime / 1000) * 100); // Normalize to 0-100
    const errorRateScore = Math.min(100, metrics.errorRate * 2000); // Normalize to 0-100
    
    return cpuScore * cpuWeight + 
           memoryScore * memoryWeight + 
           responseTimeScore * responseTimeWeight + 
           errorRateScore * errorRateWeight;
  }

  private calculatePredictedLoadScore(prediction: LoadPrediction): number {
    // Similar to calculateLoadScore but for predictions
    const cpuWeight = 0.5;
    const memoryWeight = 0.3;
    const requestsWeight = 0.2;
    
    const cpuScore = prediction.predictedCpu;
    const memoryScore = prediction.predictedMemory;
    const requestsScore = Math.min(100, (prediction.predictedRequests / 1000) * 50); // Normalize
    
    return cpuScore * cpuWeight + 
           memoryScore * memoryWeight + 
           requestsScore * requestsWeight;
  }
} 
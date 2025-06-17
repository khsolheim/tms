export interface LoadPrediction {
  timestamp: Date;
  predictedCpu: number;
  predictedMemory: number;
  predictedRequests: number;
  confidence: number;
  factors: string[];
}

export interface ServiceMetrics {
  cpu: number;
  memory: number;
  requests: number;
  replicas: number;
  responseTime: number;
  errorRate: number;
  timestamp: Date;
}

export class PredictiveScaler {
  private historicalData: Map<string, ServiceMetrics[]> = new Map();
  private models: Map<string, any> = new Map();

  constructor() {
    console.log('🔮 Predictive Scaler initialized');
  }

  async predictLoad(
    service: string,
    currentMetrics: ServiceMetrics,
    timeHorizon: string
  ): Promise<LoadPrediction[]> {
    const horizonMs = this.parseTimeHorizon(timeHorizon);
    const predictions: LoadPrediction[] = [];
    
    // Get historical data for the service
    const history = this.historicalData.get(service) || [];
    
    // Simple time-series prediction (in production, use TensorFlow.js or similar)
    const intervals = Math.ceil(horizonMs / (5 * 60 * 1000)); // 5-minute intervals
    
    for (let i = 1; i <= intervals; i++) {
      const futureTime = new Date(Date.now() + i * 5 * 60 * 1000);
      
      // Trend analysis
      const trend = this.calculateTrend(history, 'cpu');
      const seasonality = this.calculateSeasonality(futureTime);
      
      // Predict based on current metrics + trend + seasonality
      const predictedCpu = Math.max(0, Math.min(100, 
        currentMetrics.cpu + (trend * i) + seasonality.cpu
      ));
      
      const predictedMemory = Math.max(0, Math.min(100,
        currentMetrics.memory + (trend * i * 0.8) + seasonality.memory
      ));
      
      const predictedRequests = Math.max(0,
        currentMetrics.requests * (1 + trend * 0.1 * i) * seasonality.requests
      );
      
      predictions.push({
        timestamp: futureTime,
        predictedCpu,
        predictedMemory,
        predictedRequests,
        confidence: Math.max(0.3, 0.9 - (i * 0.1)), // Confidence decreases over time
        factors: this.identifyFactors(trend, seasonality)
      });
    }
    
    // Store current metrics for future predictions
    this.addHistoricalData(service, currentMetrics);
    
    return predictions;
  }

  private calculateTrend(history: ServiceMetrics[], metric: keyof ServiceMetrics): number {
    if (history.length < 2) return 0;
    
    // Simple linear regression for trend
    const recentHistory = history.slice(-10); // Last 10 data points
    const values = recentHistory.map(h => h[metric] as number);
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = values.length;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private calculateSeasonality(timestamp: Date): {
    cpu: number;
    memory: number;
    requests: number;
  } {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    // Business hours pattern (higher load 9-17)
    let hourlyFactor = 1.0;
    if (hour >= 9 && hour <= 17) {
      hourlyFactor = 1.3; // 30% higher during business hours
    } else if (hour >= 18 && hour <= 22) {
      hourlyFactor = 1.1; // 10% higher in evening
    } else {
      hourlyFactor = 0.7; // 30% lower at night
    }
    
    // Weekend pattern (lower load)
    let weeklyFactor = 1.0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weeklyFactor = 0.6; // 40% lower on weekends
    }
    
    const combinedFactor = hourlyFactor * weeklyFactor;
    
    return {
      cpu: (combinedFactor - 1) * 10, // Convert to percentage change
      memory: (combinedFactor - 1) * 8,
      requests: combinedFactor
    };
  }

  private identifyFactors(trend: number, seasonality: any): string[] {
    const factors: string[] = [];
    
    if (Math.abs(trend) > 0.5) {
      factors.push(trend > 0 ? 'increasing_trend' : 'decreasing_trend');
    }
    
    if (seasonality.requests > 1.2) {
      factors.push('peak_hours');
    } else if (seasonality.requests < 0.8) {
      factors.push('off_peak_hours');
    }
    
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      factors.push('business_hours');
    }
    
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      factors.push('weekend');
    }
    
    return factors;
  }

  private addHistoricalData(service: string, metrics: ServiceMetrics): void {
    if (!this.historicalData.has(service)) {
      this.historicalData.set(service, []);
    }
    
    const history = this.historicalData.get(service)!;
    history.push(metrics);
    
    // Keep only last 100 data points
    if (history.length > 100) {
      history.shift();
    }
  }

  private parseTimeHorizon(timeHorizon: string): number {
    const match = timeHorizon.match(/^(\d+)([smhd])$/);
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

  // Train ML model with historical data (placeholder for advanced ML)
  async trainModel(service: string): Promise<void> {
    const history = this.historicalData.get(service);
    if (!history || history.length < 10) {
      console.log(`⚠️ Insufficient data to train model for ${service}`);
      return;
    }
    
    console.log(`🧠 Training prediction model for ${service} with ${history.length} data points`);
    
    // In production, implement actual ML training here
    // For now, we'll use the statistical approach above
    this.models.set(service, {
      trained: true,
      dataPoints: history.length,
      lastTrained: new Date()
    });
  }

  getModelInfo(service: string): any {
    return this.models.get(service) || { trained: false };
  }
}
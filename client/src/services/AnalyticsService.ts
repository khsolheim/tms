/**
 * Analytics & Business Intelligence Service
 * 
 * Comprehensive analytics tracking, business metrics og data-driven insights
 * Håndterer user tracking, conversion funnel, business KPIs og custom reporting
 */

interface UserEvent {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  properties: Record<string, any>;
  category: 'navigation' | 'interaction' | 'conversion' | 'error' | 'performance';
}

interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  completionRate: number;
  dropOffPoints: Array<{ step: string; dropOffRate: number }>;
}

interface FunnelStep {
  name: string;
  eventName: string;
  users: number;
  completionRate: number;
  avgTimeToNext?: number;
}

interface BusinessMetrics {
  kpis: Record<string, { value: number; change: number; trend: 'up' | 'down' | 'stable' }>;
  conversionRates: Record<string, number>;
  userEngagement: {
    averageSessionDuration: number;
    pageViewsPerSession: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    revenuePerUser: number;
    growthRate: number;
  };
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  filters: ReportFilter[];
  metrics: string[];
  dimensions: string[];
  timeRange: { start: Date; end: Date };
  data: any[];
  generatedAt: Date;
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'between';
  value: any;
}

interface AnalyticsInsight {
  type: 'opportunity' | 'warning' | 'achievement' | 'trend';
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  recommendations?: string[];
}

class AnalyticsService {
  private events: UserEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private startTime: number;
  private lastActivityTime: number;
  private pageViews: string[] = [];
  private customMetrics: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastActivityTime = Date.now();
    
    this.setupAutoTracking();
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  /**
   * Track custom event
   */
  trackEvent(
    eventName: string, 
    properties: Record<string, any> = {},
    category: UserEvent['category'] = 'interaction'
  ): void {
    const event: UserEvent = {
      eventName,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent
      },
      category
    };

    this.events.push(event);
    this.lastActivityTime = Date.now();

    // Send to analytics backend
    this.sendEvent(event);

    // Real-time insights
    this.analyzeEventForInsights(event);
  }

  /**
   * Track page view
   */
  trackPageView(pageName?: string): void {
    const page = pageName || window.location.pathname;
    this.pageViews.push(page);
    
    this.trackEvent('page_view', {
      page,
      title: document.title,
      loadTime: performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0
    }, 'navigation');
  }

  /**
   * Track user identification
   */
  identifyUser(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId;
    
    this.trackEvent('user_identified', {
      userId,
      traits,
      sessionStartTime: this.startTime
    }, 'interaction');
  }

  /**
   * Track conversion events
   */
  trackConversion(conversionType: string, value?: number, properties: Record<string, any> = {}): void {
    this.trackEvent('conversion', {
      conversionType,
      value,
      ...properties
    }, 'conversion');

    // Update conversion metrics
    this.updateConversionMetrics(conversionType, value);
  }

  /**
   * Track business KPI
   */
  trackKPI(kpiName: string, value: number, metadata: Record<string, any> = {}): void {
    this.customMetrics.set(kpiName, value);
    
    this.trackEvent('kpi_update', {
      kpiName,
      value,
      metadata
    }, 'interaction');
  }

  // ============================================================================
  // AUTOMATIC TRACKING
  // ============================================================================

  private setupAutoTracking(): void {
    // Auto track page views
    this.trackPageView();

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button') || target;
        this.trackEvent('button_click', {
          buttonText: button.textContent?.trim(),
          buttonId: button.id,
          buttonClass: button.className
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a') || target;
        this.trackEvent('link_click', {
          linkText: link.textContent?.trim(),
          linkHref: (link as HTMLAnchorElement).href,
          isExternal: (link as HTMLAnchorElement).hostname !== window.location.hostname
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method
      }, 'conversion');
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, 'error');
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track engagement time
    let lastActiveTime = Date.now();
    setInterval(() => {
      if (Date.now() - this.lastActivityTime < 30000) { // Active within last 30 seconds
        const engagementTime = Date.now() - lastActiveTime;
        if (engagementTime > 10000) { // More than 10 seconds
          this.trackEvent('engagement_ping', {
            engagementTime,
            page: window.location.pathname
          }, 'interaction');
          lastActiveTime = Date.now();
        }
      }
    }, 30000);
  }

  private trackSessionEnd(): void {
    const sessionDuration = Date.now() - this.startTime;
    this.trackEvent('session_end', {
      sessionDuration,
      pageViews: this.pageViews.length,
      totalEvents: this.events.length,
      pages: Array.from(new Set(this.pageViews))
    }, 'interaction');
  }

  // ============================================================================
  // CONVERSION FUNNEL ANALYSIS
  // ============================================================================

  /**
   * Define and track conversion funnel
   */
  async analyzeConversionFunnel(funnelName: string, steps: string[]): Promise<ConversionFunnel> {
    const funnelData = await this.getFunnelData(steps);
    
    const funnelSteps: FunnelStep[] = [];
    let previousUsers = 0;

    for (let i = 0; i < steps.length; i++) {
      const stepUsers = funnelData[steps[i]] || 0;
      const completionRate = i === 0 ? 100 : (stepUsers / previousUsers) * 100;
      
      funnelSteps.push({
        name: steps[i],
        eventName: steps[i],
        users: stepUsers,
        completionRate,
        avgTimeToNext: await this.getAverageTimeToNextStep(steps[i], steps[i + 1])
      });

      if (i === 0) previousUsers = stepUsers;
    }

    const totalCompletionRate = funnelSteps.length > 0 
      ? (funnelSteps[funnelSteps.length - 1].users / funnelSteps[0].users) * 100 
      : 0;

    const dropOffPoints = funnelSteps
      .slice(1)
      .map((step, index) => ({
        step: step.name,
        dropOffRate: 100 - step.completionRate
      }))
      .filter(point => point.dropOffRate > 20); // Significant drop-offs

    return {
      name: funnelName,
      steps: funnelSteps,
      completionRate: totalCompletionRate,
      dropOffPoints
    };
  }

  private async getFunnelData(steps: string[]): Promise<Record<string, number>> {
    // Simulate API call to get funnel data
    const data: Record<string, number> = {};
    
    steps.forEach((step, index) => {
      // Simulate decreasing conversion through funnel
      data[step] = Math.floor(1000 * Math.pow(0.7, index));
    });

    return data;
  }

  private async getAverageTimeToNextStep(currentStep: string, nextStep?: string): Promise<number | undefined> {
    if (!nextStep) return undefined;
    
    // Simulate time calculation between funnel steps
    return Math.random() * 300000 + 60000; // 1-5 minutes
  }

  // ============================================================================
  // BUSINESS METRICS & KPIs
  // ============================================================================

  /**
   * Get comprehensive business metrics
   */
  async getBusinessMetrics(timeRange: { start: Date; end: Date }): Promise<BusinessMetrics> {
    const [kpis, conversions, engagement, revenue] = await Promise.all([
      this.getKPIs(timeRange),
      this.getConversionRates(timeRange),
      this.getUserEngagementMetrics(timeRange),
      this.getRevenueMetrics(timeRange)
    ]);

    return {
      kpis,
      conversionRates: conversions,
      userEngagement: engagement,
      revenueMetrics: revenue
    };
  }

  private async getKPIs(timeRange: { start: Date; end: Date }): Promise<Record<string, any>> {
    // Simulate KPI calculation
    return {
      monthlyActiveUsers: { value: 1250, change: 15.3, trend: 'up' as const },
      averageSessionDuration: { value: 245, change: -5.2, trend: 'down' as const },
      customerSatisfactionScore: { value: 8.7, change: 2.1, trend: 'up' as const },
      conversionRate: { value: 3.4, change: 0.8, trend: 'up' as const },
      churnRate: { value: 2.1, change: -0.5, trend: 'down' as const }
    };
  }

  private async getConversionRates(timeRange: { start: Date; end: Date }): Promise<Record<string, number>> {
    return {
      signup: 12.5,
      purchase: 3.2,
      subscription: 8.9,
      newsletter: 22.1,
      demo_request: 5.7
    };
  }

  private async getUserEngagementMetrics(timeRange: { start: Date; end: Date }) {
    return {
      averageSessionDuration: 245000, // ms
      pageViewsPerSession: 4.2,
      bounceRate: 32.1,
      returnVisitorRate: 68.9
    };
  }

  private async getRevenueMetrics(timeRange: { start: Date; end: Date }) {
    return {
      totalRevenue: 125000,
      averageOrderValue: 89.50,
      revenuePerUser: 45.20,
      growthRate: 18.5
    };
  }

  // ============================================================================
  // CUSTOM REPORTING
  // ============================================================================

  /**
   * Generate custom report with filters and metrics
   */
  async generateCustomReport(
    name: string,
    description: string,
    filters: ReportFilter[],
    metrics: string[],
    dimensions: string[],
    timeRange: { start: Date; end: Date }
  ): Promise<CustomReport> {
    const reportId = this.generateReportId();
    
    // Apply filters and aggregate data
    const rawData = await this.getFilteredData(filters, timeRange);
    const aggregatedData = this.aggregateDataByDimensions(rawData, dimensions, metrics);

    return {
      id: reportId,
      name,
      description,
      filters,
      metrics,
      dimensions,
      timeRange,
      data: aggregatedData,
      generatedAt: new Date()
    };
  }

  private async getFilteredData(filters: ReportFilter[], timeRange: { start: Date; end: Date }): Promise<any[]> {
    // Simulate filtered data retrieval
    let data = this.events.filter(event => 
      event.timestamp >= timeRange.start.getTime() && 
      event.timestamp <= timeRange.end.getTime()
    );

    // Apply filters
    for (const filter of filters) {
      data = data.filter(item => this.applyFilter(item, filter));
    }

    return data;
  }

  private applyFilter(item: any, filter: ReportFilter): boolean {
    const value = this.getNestedValue(item, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'contains':
        return String(value).includes(String(filter.value));
      case 'greater_than':
        return Number(value) > Number(filter.value);
      case 'less_than':
        return Number(value) < Number(filter.value);
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      case 'between':
        return Array.isArray(filter.value) && 
               Number(value) >= Number(filter.value[0]) && 
               Number(value) <= Number(filter.value[1]);
      default:
        return true;
    }
  }

  private aggregateDataByDimensions(data: any[], dimensions: string[], metrics: string[]): any[] {
    const groups = new Map<string, any[]>();
    
    // Group data by dimensions
    data.forEach(item => {
      const key = dimensions.map(dim => this.getNestedValue(item, dim)).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // Calculate metrics for each group
    return Array.from(groups.entries()).map(([key, groupData]) => {
      const dimensionValues = key.split('|');
      const result: any = {};
      
      dimensions.forEach((dim, index) => {
        result[dim] = dimensionValues[index];
      });

      metrics.forEach(metric => {
        result[metric] = this.calculateMetric(groupData, metric);
      });

      return result;
    });
  }

  private calculateMetric(data: any[], metric: string): number {
    switch (metric) {
      case 'count':
        return data.length;
      case 'unique_users':
        return new Set(data.map(item => item.userId).filter(Boolean)).size;
      case 'average_session_duration':
        const durations = data
          .filter(item => item.eventName === 'session_end')
          .map(item => item.properties?.sessionDuration || 0);
        return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      case 'conversion_rate':
        const conversions = data.filter(item => item.category === 'conversion').length;
        return data.length > 0 ? (conversions / data.length) * 100 : 0;
      default:
        return 0;
    }
  }

  // ============================================================================
  // INSIGHTS & RECOMMENDATIONS
  // ============================================================================

  /**
   * Generate AI-powered insights from analytics data
   */
  async generateInsights(timeRange: { start: Date; end: Date }): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    const metrics = await this.getBusinessMetrics(timeRange);
    const events = this.events.filter(e => 
      e.timestamp >= timeRange.start.getTime() && 
      e.timestamp <= timeRange.end.getTime()
    );

    // Analyze bounce rate
    if (metrics.userEngagement.bounceRate > 50) {
      insights.push({
        type: 'warning',
        title: 'Høy bounce rate oppdaget',
        description: `Bounce rate er ${metrics.userEngagement.bounceRate.toFixed(1)}%, som er over den anbefalte grensen på 50%`,
        data: { bounceRate: metrics.userEngagement.bounceRate },
        actionable: true,
        priority: 'high',
        recommendations: [
          'Forbedre landingsside innhold og relevans',
          'Optimaliser side load tid',
          'Gjennomgå og forbedre navigasjon',
          'A/B test ulike call-to-action plasseringer'
        ]
      });
    }

    // Analyze conversion trends
    const conversionEvents = events.filter(e => e.category === 'conversion');
    if (conversionEvents.length > 0) {
      const conversionRate = (conversionEvents.length / events.length) * 100;
      
      if (conversionRate < 2) {
        insights.push({
          type: 'opportunity',
          title: 'Lav konverteringsrate',
          description: `Konverteringsraten er kun ${conversionRate.toFixed(2)}%. Det er potensial for betydelig forbedring`,
          data: { conversionRate, totalEvents: events.length, conversions: conversionEvents.length },
          actionable: true,
          priority: 'high',
          recommendations: [
            'Analyser konverteringsløpet for flaskehalser',
            'Implementer exit-intent popups',
            'Forbedre trust signals og testimonials',
            'Optimaliser checkout-prosessen'
          ]
        });
      }
    }

    // Analyze user engagement
    if (metrics.userEngagement.averageSessionDuration < 120000) { // Less than 2 minutes
      insights.push({
        type: 'warning',
        title: 'Kort gjennomsnittlig session varighet',
        description: `Brukere tilbringer i gjennomsnitt kun ${(metrics.userEngagement.averageSessionDuration / 1000 / 60).toFixed(1)} minutter på siden`,
        data: { sessionDuration: metrics.userEngagement.averageSessionDuration },
        actionable: true,
        priority: 'medium',
        recommendations: [
          'Legg til mer engasjerende innhold',
          'Implementer progressive disclosure',
          'Forbedre intern lenking',
          'Legg til interaktive elementer'
        ]
      });
    }

    // Positive insights
    if (metrics.userEngagement.returnVisitorRate > 60) {
      insights.push({
        type: 'achievement',
        title: 'Høy andel gjenbesøkende',
        description: `${metrics.userEngagement.returnVisitorRate.toFixed(1)}% av brukerne kommer tilbake, som indikerer god brukeropplevelse`,
        data: { returnVisitorRate: metrics.userEngagement.returnVisitorRate },
        actionable: false,
        priority: 'low'
      });
    }

    return insights;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async sendEvent(event: UserEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  private analyzeEventForInsights(event: UserEvent): void {
    // Real-time insight analysis
    if (event.category === 'error' && event.eventName === 'javascript_error') {
      console.warn('JavaScript error detected:', event.properties);
    }
  }

  private updateConversionMetrics(conversionType: string, value?: number): void {
    // Update internal conversion tracking
    const currentValue = this.customMetrics.get(`conversion_${conversionType}`) || 0;
    this.customMetrics.set(`conversion_${conversionType}`, currentValue + (value || 1));
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateReportId(): string {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get current session analytics summary
   */
  getSessionSummary() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      duration: Date.now() - this.startTime,
      events: this.events.length,
      pageViews: this.pageViews.length,
      uniquePages: new Set(this.pageViews).size,
      customMetrics: Object.fromEntries(this.customMetrics)
    };
  }

  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'eventName', 'category', 'userId', 'sessionId', 'properties'];
      const rows = this.events.map(event => [
        new Date(event.timestamp).toISOString(),
        event.eventName,
        event.category,
        event.userId || '',
        event.sessionId,
        JSON.stringify(event.properties)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify({
      sessionSummary: this.getSessionSummary(),
      events: this.events,
      customMetrics: Object.fromEntries(this.customMetrics)
    }, null, 2);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const analyticsService = new AnalyticsService();
export default analyticsService; 
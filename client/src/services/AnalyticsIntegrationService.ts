/**
 * Analytics Integration Service
 * 
 * Integrerer med eksterne analytics tjenester (Mixpanel, Amplitude)
 * og real-time analytics streaming
 */

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

interface UserProfile {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  company?: string;
  createdAt?: string;
  lastSeen?: string;
  properties?: Record<string, any>;
}

interface AnalyticsConfig {
  mixpanelToken?: string;
  amplitudeApiKey?: string;
  enableRealTime?: boolean;
  webSocketUrl?: string;
  retryAttempts?: number;
  batchSize?: number;
  flushInterval?: number;
}

interface StreamingAnalytics {
  userId: string;
  sessionId: string;
  events: AnalyticsEvent[];
  realTimeMetrics: {
    activeUsers: number;
    pageViews: number;
    conversions: number;
    revenue: number;
  };
}

export class AnalyticsIntegrationService {
  private static instance: AnalyticsIntegrationService;
  private config: AnalyticsConfig = {};
  private eventQueue: AnalyticsEvent[] = [];
  private webSocket: WebSocket | null = null;
  private isInitialized = false;
  private flushTimer: NodeJS.Timeout | null = null;

  // External service instances
  private mixpanel: any = null;
  private amplitude: any = null;

  static getInstance(): AnalyticsIntegrationService {
    if (!AnalyticsIntegrationService.instance) {
      AnalyticsIntegrationService.instance = new AnalyticsIntegrationService();
    }
    return AnalyticsIntegrationService.instance;
  }

  /**
   * Initialize analytics integrations
   */
  async initialize(config: AnalyticsConfig): Promise<void> {
    this.config = {
      retryAttempts: 3,
      batchSize: 20,
      flushInterval: 5000, // 5 seconds
      ...config
    };

    try {
      // Initialize Mixpanel
      if (config.mixpanelToken) {
        await this.initializeMixpanel(config.mixpanelToken);
      }

      // Initialize Amplitude
      if (config.amplitudeApiKey) {
        await this.initializeAmplitude(config.amplitudeApiKey);
      }

      // Initialize real-time streaming
      if (config.enableRealTime && config.webSocketUrl) {
        await this.initializeRealTimeStreaming(config.webSocketUrl);
      }

      // Start automatic event flushing
      this.startEventFlushing();

      this.isInitialized = true;
      console.log('[AnalyticsIntegration] Initialized successfully');
      
    } catch (error) {
      console.error('[AnalyticsIntegration] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Mixpanel integration
   */
  private async initializeMixpanel(token: string): Promise<void> {
    try {
      // Dynamic import to avoid bundling if not used - fallback to mock if not available
      try {
        const mixpanelLib = await import('mixpanel-browser' as any);
        this.mixpanel = mixpanelLib.default;
      } catch {
        this.mixpanel = this.createMockMixpanel();
        console.warn('[AnalyticsIntegration] Mixpanel library not found, using mock');
        return;
      }
      
      this.mixpanel.init(token, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
        property_blacklist: ['$current_url'],
        cross_subdomain_cookie: false,
        secure_cookie: true,
        ip: false, // GDPR compliance
        opt_out_tracking_by_default: false,
      });

      console.log('[AnalyticsIntegration] Mixpanel initialized');
    } catch (error) {
      console.error('[AnalyticsIntegration] Mixpanel initialization failed:', error);
      // Fallback: Use mock implementation
      this.mixpanel = this.createMockMixpanel();
    }
  }

  /**
   * Initialize Amplitude integration
   */
  private async initializeAmplitude(apiKey: string): Promise<void> {
    try {
      // Dynamic import to avoid bundling if not used - fallback to mock if not available
      try {
        const amplitudeLib = await import('amplitude-js' as any);
        this.amplitude = amplitudeLib.default;
      } catch {
        this.amplitude = this.createMockAmplitude();
        console.warn('[AnalyticsIntegration] Amplitude library not found, using mock');
        return;
      }
      
      this.amplitude.getInstance().init(apiKey, null, {
        includeUtm: true,
        includeReferrer: true,
        trackingOptions: {
          city: false,
          ip_address: false, // GDPR compliance
        },
        logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'WARN',
        savedMaxCount: 1000,
        uploadBatchSize: 100,
        eventUploadThreshold: 30,
        eventUploadPeriodMillis: 30000,
      });

      console.log('[AnalyticsIntegration] Amplitude initialized');
    } catch (error) {
      console.error('[AnalyticsIntegration] Amplitude initialization failed:', error);
      // Fallback: Use mock implementation
      this.amplitude = this.createMockAmplitude();
    }
  }

  /**
   * Initialize real-time analytics streaming
   */
  private async initializeRealTimeStreaming(webSocketUrl: string): Promise<void> {
    try {
      this.webSocket = new WebSocket(webSocketUrl);
      
      this.webSocket.onopen = () => {
        console.log('[AnalyticsIntegration] WebSocket connected');
        this.sendStreamingAuth();
      };

      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleStreamingData(data);
        } catch (error) {
          console.error('[AnalyticsIntegration] WebSocket message parsing failed:', error);
        }
      };

      this.webSocket.onclose = () => {
        console.log('[AnalyticsIntegration] WebSocket disconnected');
        // Attempt reconnection after delay
        setTimeout(() => this.initializeRealTimeStreaming(webSocketUrl), 5000);
      };

      this.webSocket.onerror = (error) => {
        console.error('[AnalyticsIntegration] WebSocket error:', error);
      };

    } catch (error) {
      console.error('[AnalyticsIntegration] WebSocket initialization failed:', error);
    }
  }

  /**
   * Track event across all platforms
   */
  track(eventName: string, properties: Record<string, any> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'tms-web',
        sessionId: this.getSessionId(),
      },
      userId,
      timestamp: new Date().toISOString(),
    };

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Send to external services immediately for critical events
    if (this.isCriticalEvent(eventName)) {
      this.sendToExternalServices(event);
    }

    // Send to real-time stream
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.sendToStream(event);
    }

    // Auto-flush if queue is full
    if (this.eventQueue.length >= (this.config.batchSize || 20)) {
      this.flushEvents();
    }
  }

  /**
   * Identify user across all platforms
   */
  identify(userId: string, userProfile: Partial<UserProfile> = {}): void {
    // Mixpanel identify
    if (this.mixpanel) {
      this.mixpanel.identify(userId);
      this.mixpanel.people.set({
        $email: userProfile.email,
        $name: userProfile.name,
        role: userProfile.role,
        company: userProfile.company,
        ...userProfile.properties,
      });
    }

    // Amplitude identify
    if (this.amplitude) {
      const identify = new this.amplitude.Identify();
      Object.entries(userProfile).forEach(([key, value]) => {
        if (value !== undefined) {
          identify.set(key, value);
        }
      });
      this.amplitude.getInstance().identify(identify);
    }

    // Stream user identification
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify({
        type: 'identify',
        userId,
        properties: userProfile,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    // Mixpanel
    if (this.mixpanel) {
      this.mixpanel.people.set(properties);
    }

    // Amplitude
    if (this.amplitude) {
      const identify = new this.amplitude.Identify();
      Object.entries(properties).forEach(([key, value]) => {
        identify.set(key, value);
      });
      this.amplitude.getInstance().identify(identify);
    }
  }

  /**
   * Track revenue/conversion
   */
  trackRevenue(amount: number, properties: Record<string, any> = {}): void {
    const revenueEvent = {
      ...properties,
      revenue: amount,
      currency: properties.currency || 'NOK',
    };

    // Mixpanel revenue tracking
    if (this.mixpanel) {
      this.mixpanel.people.track_charge(amount, revenueEvent);
    }

    // Amplitude revenue tracking
    if (this.amplitude) {
      const revenue = new this.amplitude.Revenue()
        .setPrice(amount)
        .setQuantity(properties.quantity || 1)
        .setProductId(properties.productId || 'unknown');
      
      this.amplitude.getInstance().logRevenueV2(revenue);
    }

    // Track as regular event too
    this.track('Revenue', revenueEvent);
  }

  /**
   * Create funnel/cohort analysis
   */
  trackFunnel(funnelName: string, step: string, properties: Record<string, any> = {}): void {
    this.track(`Funnel: ${funnelName} - ${step}`, {
      ...properties,
      funnelName,
      funnelStep: step,
      funnelTimestamp: new Date().toISOString(),
    });
  }

  /**
   * Get real-time analytics data
   */
  getRealTimeData(): Promise<StreamingAnalytics | null> {
    return new Promise((resolve) => {
      if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
        resolve(null);
        return;
      }

      const requestId = Math.random().toString(36).substr(2, 9);
      
      // Send request for real-time data
      this.webSocket.send(JSON.stringify({
        type: 'getRealTimeData',
        requestId,
        timestamp: new Date().toISOString(),
      }));

      // Listen for response
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'realTimeData' && data.requestId === requestId) {
            this.webSocket!.removeEventListener('message', messageHandler);
            resolve(data.analytics);
          }
        } catch (error) {
          console.error('[AnalyticsIntegration] Real-time data parsing failed:', error);
        }
      };

      this.webSocket.addEventListener('message', messageHandler);

      // Timeout after 5 seconds
      setTimeout(() => {
        this.webSocket?.removeEventListener('message', messageHandler);
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Flush queued events to external services
   */
  flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    events.forEach(event => {
      this.sendToExternalServices(event);
    });

    console.log(`[AnalyticsIntegration] Flushed ${events.length} events`);
  }

  /**
   * Start automatic event flushing
   */
  private startEventFlushing(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval || 5000);
  }

  /**
   * Send event to external services
   */
  private sendToExternalServices(event: AnalyticsEvent): void {
    // Send to Mixpanel
    if (this.mixpanel) {
      this.mixpanel.track(event.name, event.properties);
    }

    // Send to Amplitude
    if (this.amplitude) {
      this.amplitude.getInstance().logEvent(event.name, event.properties);
    }
  }

  /**
   * Send event to real-time stream
   */
  private sendToStream(event: AnalyticsEvent): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify({
        type: 'event',
        event,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Handle incoming streaming data
   */
  private handleStreamingData(data: any): void {
    switch (data.type) {
      case 'realTimeMetrics':
        // Broadcast real-time metrics to subscribers
        window.dispatchEvent(new CustomEvent('tms-analytics-realtime', {
          detail: data.metrics
        }));
        break;
      
      case 'alert':
        // Handle analytics alerts (sudden spikes, drops, etc.)
        console.warn('[AnalyticsIntegration] Alert:', data.message);
        break;
      
      default:
        console.log('[AnalyticsIntegration] Unknown streaming data:', data);
    }
  }

  /**
   * Send authentication to streaming service
   */
  private sendStreamingAuth(): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify({
        type: 'auth',
        token: this.getAuthToken(),
        userId: this.getCurrentUserId(),
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Check if event is critical (needs immediate sending)
   */
  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'Purchase',
      'Signup',
      'Login',
      'Error',
      'Payment',
      'Subscription',
    ];
    return criticalEvents.some(critical => eventName.includes(critical));
  }

  /**
   * Utility methods
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('tms_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('tms_session_id', sessionId);
    }
    return sessionId;
  }

  private getCurrentUserId(): string {
    return localStorage.getItem('tms_user_id') || 'anonymous';
  }

  private getAuthToken(): string {
    return localStorage.getItem('tms_auth_token') || '';
  }

  /**
   * Mock implementations for fallback
   */
  private createMockMixpanel() {
    return {
      init: () => {},
      track: (event: string, properties: any) => {
        console.log('[Mock Mixpanel] Track:', event, properties);
      },
      identify: (userId: string) => {
        console.log('[Mock Mixpanel] Identify:', userId);
      },
      people: {
        set: (properties: any) => {
          console.log('[Mock Mixpanel] Set properties:', properties);
        },
        track_charge: (amount: number, properties: any) => {
          console.log('[Mock Mixpanel] Track charge:', amount, properties);
        },
      },
    };
  }

  private createMockAmplitude() {
    return {
      getInstance: () => ({
        init: () => {},
        logEvent: (event: string, properties: any) => {
          console.log('[Mock Amplitude] Track:', event, properties);
        },
        identify: (identify: any) => {
          console.log('[Mock Amplitude] Identify:', identify);
        },
        logRevenueV2: (revenue: any) => {
          console.log('[Mock Amplitude] Revenue:', revenue);
        },
      }),
      Identify: function() {
        return {
          set: (key: string, value: any) => {
            console.log('[Mock Amplitude] Set property:', key, value);
            return this;
          },
        };
      },
      Revenue: function() {
        return {
          setPrice: (price: number) => {
            console.log('[Mock Amplitude] Set price:', price);
            return this;
          },
          setQuantity: (quantity: number) => {
            console.log('[Mock Amplitude] Set quantity:', quantity);
            return this;
          },
          setProductId: (productId: string) => {
            console.log('[Mock Amplitude] Set product ID:', productId);
            return this;
          },
        };
      },
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }

    // Flush remaining events
    this.flushEvents();

    this.isInitialized = false;
    console.log('[AnalyticsIntegration] Service destroyed');
  }
}

// Export singleton instance
export const analyticsIntegration = AnalyticsIntegrationService.getInstance();
export default analyticsIntegration; 
/**
 * Real User Monitoring (RUM) Service
 * 
 * Frontend performance monitoring og user experience tracking
 * Samler inn real-world metrics fra brukers enheter
 */

interface PerformanceMetrics {
  // Core Web Vitals
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  
  // Additional metrics
  TTFB: number; // Time to First Byte
  domLoadTime: number;
  windowLoadTime: number;
  
  // User context
  userAgent: string;
  connectionType: string;
  deviceMemory: number;
  hardwareConcurrency: number;
  
  // Page context
  url: string;
  timestamp: number;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'resize' | 'form_submit' | 'navigation';
  element?: string;
  timestamp: number;
  duration?: number;
  value?: any;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userAgent: string;
  url: string;
}

class RUMService {
  private metrics: PerformanceMetrics[] = [];
  private interactions: UserInteraction[] = [];
  private errors: ErrorEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isMonitoring = false;
  private observer?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupInteractionTracking();
  }

  /**
   * Start monitoring
   */
  startMonitoring(userId?: string): void {
    this.userId = userId;
    this.isMonitoring = true;
    
    // Collect initial performance data
    this.collectNavigationMetrics();
    
         // Send data periodically
     const intervalId = setInterval(() => {
       this.sendMetrics();
     }, 30000); // Every 30 seconds
     
     // Store interval ID for cleanup
     (this as any).intervalId = intervalId;

    // Send data before page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics(true);
    });

    console.log('RUM monitoring started', { sessionId: this.sessionId, userId });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.observer) {
      this.observer.disconnect();
    }
    console.log('RUM monitoring stopped');
  }

  /**
   * Setup Performance Observer for Core Web Vitals
   */
  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observe paint metrics (FCP)
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
          }
        });
      });
      this.observer.observe({ entryTypes: ['paint'] });

      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe FID
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Performance Observer setup failed:', error);
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }

  /**
   * Setup user interaction tracking
   */
  private setupInteractionTracking(): void {
    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(target),
        timestamp: Date.now()
      });
    });

         // Scroll tracking (throttled)
     let scrollTimeout: NodeJS.Timeout | undefined;
     document.addEventListener('scroll', () => {
       if (scrollTimeout) clearTimeout(scrollTimeout);
       scrollTimeout = setTimeout(() => {
         this.recordInteraction({
           type: 'scroll',
           timestamp: Date.now(),
           value: window.scrollY
         });
       }, 100);
     });

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.recordInteraction({
        type: 'form_submit',
        element: form.id || form.className,
        timestamp: Date.now()
      });
    });

    // Page navigation
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      window.dispatchEvent(new Event('rum-navigation'));
    };

    window.addEventListener('rum-navigation', () => {
      this.recordInteraction({
        type: 'navigation',
        timestamp: Date.now(),
        value: window.location.href
      });
      this.collectNavigationMetrics();
    });
  }

  /**
   * Collect navigation performance metrics
   */
  private collectNavigationMetrics(): void {
    if (!performance.timing) return;

    const timing = performance.timing;
    // Note: performance.navigation is deprecated but kept for compatibility

    // Calculate metrics
    const TTFB = timing.responseStart - timing.navigationStart;
    const domLoadTime = timing.domContentLoadedEventEnd - timing.navigationStart;
    const windowLoadTime = timing.loadEventEnd - timing.navigationStart;

    // Get connection info
    const connection = (navigator as any).connection || {};
    
    // Get device info
    const deviceMemory = (navigator as any).deviceMemory || 0;
    const hardwareConcurrency = navigator.hardwareConcurrency || 0;

    const metrics: Partial<PerformanceMetrics> = {
      TTFB,
      domLoadTime,
      windowLoadTime,
      userAgent: navigator.userAgent,
      connectionType: connection.effectiveType || 'unknown',
      deviceMemory,
      hardwareConcurrency,
      url: window.location.href,
      timestamp: Date.now()
    };

    this.updateCurrentMetrics(metrics);
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: keyof PerformanceMetrics, value: number): void {
    if (!this.isMonitoring) return;

    const currentMetrics = this.getCurrentMetrics();
    (currentMetrics as any)[name] = value;
    
    console.log(`RUM Metric: ${name} = ${value}ms`);
  }

  /**
   * Record user interaction
   */
  private recordInteraction(interaction: UserInteraction): void {
    if (!this.isMonitoring) return;

    this.interactions.push(interaction);
    
    // Keep only last 100 interactions
    if (this.interactions.length > 100) {
      this.interactions = this.interactions.slice(-100);
    }
  }

  /**
   * Record error
   */
  private recordError(error: ErrorEvent): void {
    if (!this.isMonitoring) return;

    this.errors.push(error);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    console.error('RUM Error recorded:', error);
  }

  /**
   * Get current metrics object
   */
  private getCurrentMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      const newMetrics = {
        FCP: 0,
        LCP: 0,
        FID: 0,
        CLS: 0,
        TTFB: 0,
        domLoadTime: 0,
        windowLoadTime: 0,
        userAgent: navigator.userAgent,
        connectionType: 'unknown',
        deviceMemory: 0,
        hardwareConcurrency: 0,
        url: window.location.href,
        timestamp: Date.now()
      };
      this.metrics.push(newMetrics);
      return newMetrics;
    }
    
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Update current metrics
   */
  private updateCurrentMetrics(updates: Partial<PerformanceMetrics>): void {
    const current = this.getCurrentMetrics();
    Object.assign(current, updates);
  }

  /**
   * Send metrics to server
   */
  private async sendMetrics(isFinal = false): Promise<void> {
    if (!this.isMonitoring && !isFinal) return;

    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      metrics: this.metrics,
      interactions: this.interactions,
      errors: this.errors,
      isFinal,
      timestamp: Date.now()
    };

    try {
      if (isFinal && 'sendBeacon' in navigator) {
        // Use sendBeacon for final data to ensure delivery
        navigator.sendBeacon('/api/rum/metrics', JSON.stringify(data));
      } else {
        // Regular fetch for periodic updates
        await fetch('/api/rum/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      }

      // Clear sent data
      this.interactions = [];
      this.errors = [];
      
    } catch (error) {
      console.warn('Failed to send RUM metrics:', error);
    }
  }

  /**
   * Get element selector for interaction tracking
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `rum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current performance summary
   */
  getPerformanceSummary(): {
    coreWebVitals: { FCP: number; LCP: number; FID: number; CLS: number };
    loadTimes: { TTFB: number; domLoad: number; windowLoad: number };
    deviceInfo: { memory: number; cores: number; connection: string };
    interactionCount: number;
    errorCount: number;
  } {
    const current = this.getCurrentMetrics();
    
    return {
      coreWebVitals: {
        FCP: current.FCP || 0,
        LCP: current.LCP || 0,
        FID: current.FID || 0,
        CLS: current.CLS || 0
      },
      loadTimes: {
        TTFB: current.TTFB || 0,
        domLoad: current.domLoadTime || 0,
        windowLoad: current.windowLoadTime || 0
      },
      deviceInfo: {
        memory: current.deviceMemory || 0,
        cores: current.hardwareConcurrency || 0,
        connection: current.connectionType || 'unknown'
      },
      interactionCount: this.interactions.length,
      errorCount: this.errors.length
    };
  }

  /**
   * Manual performance mark
   */
  mark(name: string): void {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  /**
   * Manual performance measure
   */
  measure(name: string, startMark: string, endMark?: string): void {
    if ('performance' in window && 'measure' in performance) {
      performance.measure(name, startMark, endMark);
      
      // Get the measurement
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        console.log(`RUM Measure: ${name} = ${duration}ms`);
      }
    }
  }
}

// Export singleton instance
export const rumService = new RUMService();
export default rumService; 
import * as Sentry from '@sentry/react';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  organizationId?: string;
  organizationName?: string;
}

class SentryService {
  private initialized = false;
  private config: SentryConfig | null = null;

  /**
   * Initialiser Sentry med konfigurasjon
   */
  initialize(config: SentryConfig): void {
    if (this.initialized) {
      console.warn('Sentry er allerede initialiseret');
      return;
    }

    this.config = config;

    // Kun initialiser Sentry hvis DSN er satt (produksjon/staging)
    if (!config.dsn) {
      console.log('Sentry DSN ikke satt - error tracking deaktivert');
      return;
    }

    try {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        
        // Error sampling - lavere i produksjon for å spare kostnader
        sampleRate: config.environment === 'production' ? 0.1 : 1.0,

        // Filtering før sending
        beforeSend(event, hint) {
          // Filtrer ut lokale development errors
          if (config.environment === 'development' && event.exception) {
            const error = hint.originalException;
            if (error instanceof Error) {
              // Ikke send vanlige development errors til Sentry
              if (error.message.includes('ChunkLoadError') || 
                  error.message.includes('Loading chunk') ||
                  error.message.includes('Failed to fetch')) {
                return null;
              }
            }
          }

          // Legg til brukerkontext
          if (event.user && config.userId) {
            event.user.id = config.userId;
            event.user.email = config.userEmail;
            event.user.username = config.userName;
          }

          // Organization tags
          if (config.organizationId) {
            event.tags = {
              ...event.tags,
              organizationId: config.organizationId,
              organizationName: config.organizationName,
            };
          }

          return event;
        },
      });

      // Set initial user context
      this.setUserContext({
        id: config.userId,
        email: config.userEmail,
        username: config.userName,
      });

      this.initialized = true;
      console.log('✅ Sentry initialiseret for', config.environment);

    } catch (error) {
      console.error('❌ Feil ved initialisering av Sentry:', error);
    }
  }

  /**
   * Oppdater brukerkontext
   */
  setUserContext(user: {
    id?: string;
    email?: string;
    username?: string;
    [key: string]: any;
  }): void {
    if (!this.initialized) return;

    Sentry.setUser(user);
  }

  /**
   * Legg til ekstra kontekst
   */
  setContext(key: string, context: any): void {
    if (!this.initialized) return;

    Sentry.setContext(key, context);
  }

  /**
   * Legg til tags
   */
  setTag(key: string, value: string): void {
    if (!this.initialized) return;

    Sentry.setTag(key, value);
  }

  /**
   * Capture custom error
   */
  captureError(error: Error, context?: {
    level?: 'error' | 'warning' | 'info' | 'debug';
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: Record<string, any>;
  }): void {
    if (!this.initialized) {
      console.error('Sentry error (ikke sendt):', error);
      return;
    }

    Sentry.withScope((scope) => {
      if (context?.level) scope.setLevel(context.level);
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      if (context?.user) scope.setUser(context.user);

      Sentry.captureException(error);
    });
  }

  /**
   * Capture custom message
   */
  captureMessage(message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info'): void {
    if (!this.initialized) {
      console.log(`Sentry message (ikke sendt): [${level}] ${message}`);
      return;
    }

    Sentry.captureMessage(message, level);
  }

  /**
   * Legg til breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'error' | 'warning' | 'info' | 'debug';
    data?: Record<string, any>;
  }): void {
    if (!this.initialized) return;

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'custom',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * API error tracking - høy prioritet for TMS
   */
  trackApiError(endpoint: string, error: any, context?: Record<string, any>): void {
    const apiError = new Error(`API Error: ${endpoint}`);
    
    this.captureError(apiError, {
      level: 'error',
      tags: {
        errorType: 'api_error',
        endpoint: endpoint,
        statusCode: error.response?.status?.toString() || 'unknown',
      },
      extra: {
        endpoint,
        method: context?.method || 'unknown',
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestData: context?.requestData,
        originalError: error.message,
        stack: error.stack,
      },
    });
  }

  /**
   * User action tracking for debugging
   */
  trackUserAction(action: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user_action',
      level: 'info',
      data: {
        action,
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Critical business error tracking
   */
  trackBusinessError(operation: string, error: Error, context?: Record<string, any>): void {
    this.captureError(error, {
      level: 'error',
      tags: {
        errorType: 'business_error',
        operation,
      },
      extra: {
        operation,
        context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Performance warning for slow operations
   */
  trackPerformanceWarning(operation: string, duration: number, threshold: number = 1000): void {
    if (duration > threshold) {
      this.addBreadcrumb({
        message: `Slow operation: ${operation}`,
        category: 'performance',
        level: 'warning',
        data: {
          operation,
          duration,
          threshold,
        },
      });

      // Send warning for very slow operations
      if (duration > threshold * 3) {
        this.captureMessage(
          `Very slow operation: ${operation} took ${duration}ms`,
          'warning'
        );
      }
    }
  }

  /**
   * Security event tracking
   */
  trackSecurityEvent(event: string, details: Record<string, any>): void {
    this.captureMessage(`Security event: ${event}`, 'warning');
    
    this.addBreadcrumb({
      message: `Security: ${event}`,
      category: 'security',
      level: 'warning',
      data: details,
    });
  }

  /**
   * Sjekk om Sentry er aktivt
   */
  isEnabled(): boolean {
    return this.initialized && !!this.config?.dsn;
  }

  /**
   * Get current config for debugging
   */
  getConfig(): SentryConfig | null {
    return this.config;
  }

  /**
   * Manual flush for critical errors
   */
  async flush(timeout: number = 5000): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      return await Sentry.flush(timeout);
    } catch (error) {
      console.error('Feil ved flushing av Sentry events:', error);
      return false;
    }
  }
}

// Eksporter singleton instance
export const sentryService = new SentryService();

// Eksporter enkle funksjoner for vanlig bruk
export const trackError = sentryService.captureError.bind(sentryService);
export const trackMessage = sentryService.captureMessage.bind(sentryService);
export const trackApiError = sentryService.trackApiError.bind(sentryService);
export const trackUserAction = sentryService.trackUserAction.bind(sentryService);
export const trackBusinessError = sentryService.trackBusinessError.bind(sentryService);
export const trackPerformanceWarning = sentryService.trackPerformanceWarning.bind(sentryService);
export const trackSecurityEvent = sentryService.trackSecurityEvent.bind(sentryService); 
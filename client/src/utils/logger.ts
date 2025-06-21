interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

type LogLevelKey = keyof LogLevel;

class Logger {
  private currentLevel: number;

  constructor() {
    // I produksjon, vis kun ERROR og WARN
    // I development, vis alt
    this.currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
  }

  private shouldLog(level: LogLevelKey): boolean {
    return LOG_LEVELS[level] >= this.currentLevel;
  }

  private formatMessage(level: LogLevelKey, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    
    if (data !== undefined) {
      console[level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](`${prefix} ${message}`, data);
    } else {
      console[level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](`${prefix} ${message}`);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('DEBUG')) {
      this.formatMessage('DEBUG', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('INFO')) {
      this.formatMessage('INFO', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('WARN')) {
      this.formatMessage('WARN', message, data);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('ERROR')) {
      this.formatMessage('ERROR', message, error);
      
      // I produksjon, send også til error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Error tracking integrasjon kan legges til når det besluttes hvilken tjeneste som skal brukes
        this.sendToErrorTracking(message, error);
      }
    }
  }

  private sendToErrorTracking(message: string, error?: any): void {
    // Integrer med Sentry for error tracking
    if (window.location.hostname !== 'localhost') {
      try {
        // Dynamisk import for å unngå sirkulære avhengigheter
        import('../config/sentry').then(({ sentryService }) => {
          if (sentryService.isEnabled()) {
            if (error instanceof Error) {
              sentryService.captureError(error, {
                level: 'error',
                tags: { source: 'logger' },
                extra: { logMessage: message },
              });
            } else {
              sentryService.captureMessage(message, 'error');
            }
          }
        }).catch(() => {
          // Ignore Sentry import errors - ikke kritisk
        });
      } catch (e) {
        // Feil ved error tracking skal ikke krasje appen
      }
    }
  }

  // Spesial metoder for vanlige use cases
  apiError(endpoint: string, error: any): void {
    this.error(`API feil for ${endpoint}`, {
      endpoint,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
  }

  userAction(action: string, data?: any): void {
    this.info(`Brukerhandling: ${action}`, data);
  }

  performance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} tok ${duration}ms`);
  }
}

// Eksporter en singleton instans
export const logger = new Logger();

// Type-safe wrapper for å erstatte console.log
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiError: logger.apiError.bind(logger),
  userAction: logger.userAction.bind(logger),
  performance: logger.performance.bind(logger),
};

// Disable console.log i produksjon
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.debug = () => {};
} 
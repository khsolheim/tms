import { sentryService, type SentryConfig } from '../services/SentryService';

/**
 * Initialiser Sentry for TMS applikasjon
 * Dette kalles tidlig i app bootstrap prosessen
 */
export function initializeSentry(): void {
  // Hent Sentry konfigurasjon fra environment variabler
  const sentryConfig: SentryConfig = {
    dsn: process.env.REACT_APP_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.REACT_APP_VERSION || '1.0.0',
    // Brukerdata settes senere når bruker logger inn
    userId: undefined,
    userEmail: undefined,
    userName: undefined,
    organizationId: undefined,
    organizationName: undefined,
  };

  // Initialiser Sentry service
  sentryService.initialize(sentryConfig);

  // Setup global error handler som backup
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      if (sentryService.isEnabled()) {
        sentryService.captureError(
          new Error(`Unhandled Promise Rejection: ${event.reason}`),
          {
            level: 'error',
            tags: { errorType: 'unhandled_promise_rejection' },
            extra: { reason: event.reason },
          }
        );
      }
    });

    // Global error handler for ikke-React feil
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      if (sentryService.isEnabled() && event.error) {
        sentryService.captureError(event.error, {
          level: 'error',
          tags: { errorType: 'global_error' },
          extra: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      }
    });
  }

  console.log('🔧 Sentry konfigurasjon fullført');
}

/**
 * Oppdater Sentry med brukerinformasjon etter innlogging
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  navn?: string;
  rolle?: string;
  bedriftId?: string;
  bedriftNavn?: string;
}): void {
  if (!sentryService.isEnabled()) return;

  sentryService.setUserContext({
    id: user.id,
    email: user.email,
    username: user.navn,
    role: user.rolle,
  });

  // Legg til organisasjon tags hvis tilgjengelig
  if (user.bedriftId && user.bedriftNavn) {
    sentryService.setTag('organizationId', user.bedriftId);
    sentryService.setTag('organizationName', user.bedriftNavn);
  }

  if (user.rolle) {
    sentryService.setTag('userRole', user.rolle);
  }

  console.log('👤 Sentry brukerkontext oppdatert');
}

/**
 * Fjern brukerinformasjon ved utlogging
 */
export function clearSentryUser(): void {
  if (!sentryService.isEnabled()) return;

  sentryService.setUserContext({});
  console.log('👤 Sentry brukerkontext tømt');
}

/**
 * Spesialiser Sentry tags for TMS moduler
 */
export function setSentryModuleContext(module: string, context?: Record<string, any>): void {
  if (!sentryService.isEnabled()) return;

  sentryService.setTag('module', module);
  
  if (context) {
    sentryService.setContext('moduleContext', context);
  }
}

// Eksporter konfigurasjon og hjelpefunksjoner
export { sentryService };
export * from '../services/SentryService'; 
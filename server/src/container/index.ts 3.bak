/**
 * Dependency Injection Container
 * 
 * Enkel DI-implementering for å håndtere service dependencies
 * og gjøre koden mer testbar og skalerbar
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export type ServiceType = 'singleton' | 'transient';

interface ServiceDefinition<T = any> {
  factory: (container: Container) => T;
  type: ServiceType;
  instance?: T;
}

export class Container {
  private services = new Map<string, ServiceDefinition>();
  private initialized = false;

  /**
   * Registrer en service i containeren
   */
  register<T>(
    token: string,
    factory: (container: Container) => T,
    type: ServiceType = 'singleton'
  ): void {
    if (this.initialized && type === 'singleton') {
      logger.warn('Attempting to register service after container initialization', { token });
    }

    this.services.set(token, {
      factory,
      type,
      instance: undefined
    });

    logger.debug('Service registered', { token, type });
  }

  /**
   * Resolve en service fra containeren
   */
  resolve<T>(token: string): T {
    const serviceDefinition = this.services.get(token);
    
    if (!serviceDefinition) {
      throw new Error(`Service ikke registrert: ${token}`);
    }

    // For singleton services, return cached instance
    if (serviceDefinition.type === 'singleton') {
      if (serviceDefinition.instance) {
        return serviceDefinition.instance as T;
      }
      
      serviceDefinition.instance = serviceDefinition.factory(this);
      return serviceDefinition.instance as T;
    }

    // For transient services, always create new instance
    return serviceDefinition.factory(this) as T;
  }

  /**
   * Sjekk om en service er registrert
   */
  has(token: string): boolean {
    return this.services.has(token);
  }

  /**
   * List alle registrerte services
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Cleanup - dispose alle singleton instances
   */
  async dispose(): Promise<void> {
    logger.info('Disposing container services');

    for (const [token, definition] of this.services.entries()) {
      if (definition.instance && typeof definition.instance.cleanup === 'function') {
        try {
          await definition.instance.cleanup();
          logger.debug('Service cleaned up', { token });
        } catch (error) {
          logger.error('Error cleaning up service', { token, error });
        }
      }
    }

    this.services.clear();
    this.initialized = false;
  }

  /**
   * Initialize container (mark as initialized)
   */
  initialize(): void {
    this.initialized = true;
    logger.info('Container initialized with services', { 
      services: this.getRegisteredServices() 
    });
  }
}

// Service tokens (strong typing)
export const SERVICE_TOKENS = {
  PRISMA_CLIENT: 'PRISMA_CLIENT',
  KONTRAKT_SERVICE: 'KONTRAKT_SERVICE',
  BEDRIFT_SERVICE: 'BEDRIFT_SERVICE',
  ANSATT_SERVICE: 'ANSATT_SERVICE',
  ELEV_SERVICE: 'ELEV_SERVICE',
  EMAIL_SERVICE: 'EMAIL_SERVICE',
  QUIZ_SERVICE: 'QUIZ_SERVICE',
  SYSTEMCONFIG_SERVICE: 'SYSTEMCONFIG_SERVICE'
} as const;

// Global container instance
export const container = new Container();

/**
 * Setup all services in the container
 */
export function setupContainer(): void {
  logger.info('Setting up dependency injection container');

  // Infrastructure services
  container.register(SERVICE_TOKENS.PRISMA_CLIENT, () => new PrismaClient(), 'singleton');

  // Business services
  container.register(SERVICE_TOKENS.KONTRAKT_SERVICE, (c) => {
    const KontraktService = require('../services/kontrakt.service').KontraktService;
    return new KontraktService();
  }, 'singleton');

  container.register(SERVICE_TOKENS.BEDRIFT_SERVICE, (c) => {
    const BedriftService = require('../services/bedrift.service').BedriftService;
    return new BedriftService();
  }, 'singleton');

  container.register(SERVICE_TOKENS.ANSATT_SERVICE, (c) => {
    const AnsattService = require('../services/ansatt.service').AnsattService;
    return new AnsattService();
  }, 'singleton');

  container.register(SERVICE_TOKENS.ELEV_SERVICE, (c) => {
    const ElevService = require('../services/elev.service').ElevService;
    return new ElevService();
  }, 'singleton');

  container.register(SERVICE_TOKENS.EMAIL_SERVICE, (c) => {
    const { emailService } = require('../services/email.service');
    return emailService;
  }, 'singleton');

  container.register(SERVICE_TOKENS.QUIZ_SERVICE, (c) => {
    const QuizService = require('../services/quiz.service').QuizService;
    return new QuizService();
  }, 'singleton');

  container.register(SERVICE_TOKENS.SYSTEMCONFIG_SERVICE, (c) => {
    const SystemConfigService = require('../services/systemconfig.service').SystemConfigService;
    return new SystemConfigService();
  }, 'singleton');

  container.initialize();
}

/**
 * Helper function for resolving services
 */
export function getService<T>(token: string): T {
  return container.resolve<T>(token);
}

/**
 * Cleanup on process exit
 */
process.on('SIGINT', async () => {
  logger.info('SIGINT received, cleaning up container');
  await container.dispose();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, cleaning up container');
  await container.dispose();
  process.exit(0);
}); 
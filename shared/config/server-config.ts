import serverConfig from '../../server-config.json';

export interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  healthEndpoint?: string;
  endpoints?: Record<string, string>;
  description: string;
  graphqlEndpoint?: string;
  playgroundEndpoint?: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  type: string;
  name: string;
  description: string;
}

export interface MainAppConfig {
  frontend: {
    url: string;
    port: number;
    description: string;
  };
  admin: {
    url: string;
    port: number;
    description: string;
  };
  backend: {
    url: string;
    port: number;
    baseApiPath: string;
    description: string;
  };
  database?: DatabaseConfig;
  cache?: {
    host: string;
    port: number;
    type: string;
    description: string;
  };
}

export interface MicroservicesConfig {
  infrastructure: {
    database: DatabaseConfig;
    cache: {
      host: string;
      port: number;
      type: string;
      description: string;
    };
  };
  services: Record<string, ServiceConfig>;
}

export interface EnvironmentConfig {
  mainApp: MainAppConfig;
  microservices?: MicroservicesConfig;
}

export interface ServerConfig {
  name: string;
  version: string;
  updated: string;
  description: string;
  environments: {
    development: EnvironmentConfig;
    production: EnvironmentConfig;
  };
  serviceDiscovery: {
    enabled: boolean;
    consul: {
      host: string;
      port: number;
    };
  };
  loadBalancing: {
    enabled: boolean;
    strategy: string;
  };
  monitoring: {
    prometheus: {
      url: string;
      port: number;
    };
    grafana: {
      url: string;
      port: number;
    };
  };
}

class ServerConfigManager {
  private config: ServerConfig;
  private environment: 'development' | 'production';

  constructor() {
    this.config = serverConfig as ServerConfig;
    this.environment = (process.env.NODE_ENV as 'development' | 'production') || 'development';
  }

  getEnvironment(): 'development' | 'production' {
    return this.environment;
  }

  setEnvironment(env: 'development' | 'production'): void {
    this.environment = env;
  }

  getMainAppConfig(): MainAppConfig {
    return this.config.environments[this.environment].mainApp;
  }

  getMicroservicesConfig(): MicroservicesConfig | undefined {
    return this.config.environments[this.environment].microservices;
  }

  getServiceConfig(serviceName: string): ServiceConfig | undefined {
    const microservices = this.getMicroservicesConfig();
    return microservices?.services[serviceName];
  }

  getServiceUrl(serviceName: string): string | undefined {
    const service = this.getServiceConfig(serviceName);
    return service?.url;
  }

  getServiceEndpoint(serviceName: string, endpointName: string): string | undefined {
    const service = this.getServiceConfig(serviceName);
    if (!service || !service.endpoints) return undefined;
    
    const endpoint = service.endpoints[endpointName];
    return endpoint ? `${service.url}${endpoint}` : undefined;
  }

  getDatabaseConfig(): DatabaseConfig | undefined {
    return this.getMainAppConfig().database;
  }

  getMicroservicesDatabaseConfig(): DatabaseConfig | undefined {
    return this.getMicroservicesConfig()?.infrastructure.database;
  }

  getCacheConfig(): { host: string; port: number } | undefined {
    return this.getMainAppConfig().cache;
  }

  getMicroservicesCacheConfig(): { host: string; port: number } | undefined {
    return this.getMicroservicesConfig()?.infrastructure.cache;
  }

  getBackendUrl(): string {
    return this.getMainAppConfig().backend.url;
  }

  getBackendApiUrl(): string {
    const backend = this.getMainAppConfig().backend;
    return `${backend.url}${backend.baseApiPath}`;
  }

  getFrontendUrl(): string {
    return this.getMainAppConfig().frontend.url;
  }

  getAdminUrl(): string {
    return this.getMainAppConfig().admin.url;
  }

  getMonitoringConfig() {
    return this.config.monitoring;
  }

  getAllServices(): ServiceConfig[] {
    const microservices = this.getMicroservicesConfig();
    if (!microservices) return [];
    
    return Object.values(microservices.services);
  }

  getHealthCheckUrls(): Record<string, string> {
    const healthChecks: Record<string, string> = {};
    
    // Main app health check
    healthChecks.backend = `${this.getBackendApiUrl()}/health`;
    
    // Microservices health checks
    const services = this.getAllServices();
    services.forEach(service => {
      if (service.healthEndpoint) {
        healthChecks[service.name] = `${service.url}${service.healthEndpoint}`;
      }
    });
    
    return healthChecks;
  }
}

// Singleton instance
export const serverConfigManager = new ServerConfigManager();

// Export for convenience
export default serverConfigManager; 
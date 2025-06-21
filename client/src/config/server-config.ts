// Klient-spesifikk server konfigurasjon
export interface ClientServerConfig {
  backend: {
    url: string;
    apiUrl: string;
  };
  services: {
    [key: string]: {
      url: string;
      endpoints?: {
        [key: string]: string;
      };
    };
  };
}

class ClientServerConfigManager {
  private config: ClientServerConfig;

  constructor() {
    // Standard konfigurasjon for TMS klient
    this.config = {
      backend: {
        url: process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000',
        apiUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000' + '/api',
      },
      services: {
        auth: {
          url: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8001',
          endpoints: {
            refresh: '/auth/refresh'
          }
        },
        user: {
          url: process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:8002'
        },
        hr: {
          url: process.env.REACT_APP_HR_SERVICE_URL || 'http://localhost:8003'
        },
        quiz: {
          url: process.env.REACT_APP_QUIZ_SERVICE_URL || 'http://localhost:8004'
        },
        sikkerhetskontroll: {
          url: process.env.REACT_APP_SIKKERHETSKONTROLL_SERVICE_URL || 'http://localhost:8005'
        },
        notification: {
          url: process.env.REACT_APP_NOTIFICATION_SERVICE_URL || 'http://localhost:8006'
        },
        ml: {
          url: process.env.REACT_APP_ML_SERVICE_URL || 'http://localhost:8007'
        },
        blockchain: {
          url: process.env.REACT_APP_BLOCKCHAIN_SERVICE_URL || 'http://localhost:8008'
        },
        economy: {
          url: process.env.REACT_APP_ECONOMY_SERVICE_URL || 'http://localhost:8009'
        },
        graphql: {
          url: process.env.REACT_APP_GRAPHQL_SERVICE_URL || 'http://localhost:8010'
        }
      }
    };
  }

  getBackendUrl(): string {
    return this.config.backend.url;
  }

  getBackendApiUrl(): string {
    return this.config.backend.apiUrl;
  }

  getServiceUrl(serviceName: string): string | null {
    const service = this.config.services[serviceName];
    return service ? service.url : null;
  }

  getServiceEndpoint(serviceName: string, endpoint: string): string | null {
    const service = this.config.services[serviceName];
    if (!service) return null;
    
    if (service.endpoints && service.endpoints[endpoint]) {
      return service.url + service.endpoints[endpoint];
    }
    
    return service.url + '/' + endpoint;
  }

  getAllServices(): string[] {
    return Object.keys(this.config.services);
  }

  getHealthCheckUrls(): Record<string, string> {
    const healthChecks: Record<string, string> = {};
    
    // Backend health check
    healthChecks.backend = this.config.backend.url + '/health';
    
    // Service health checks
    Object.entries(this.config.services).forEach(([name, service]) => {
      healthChecks[name] = service.url + '/health';
    });
    
    return healthChecks;
  }

  updateServiceUrl(serviceName: string, url: string): void {
    if (this.config.services[serviceName]) {
      this.config.services[serviceName].url = url;
    }
  }

  addService(serviceName: string, config: { url: string; endpoints?: { [key: string]: string } }): void {
    this.config.services[serviceName] = config;
  }
}

// Export singleton instance
const clientServerConfigManager = new ClientServerConfigManager();
export default clientServerConfigManager; 
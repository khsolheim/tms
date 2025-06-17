// Admin-spesifikk server konfigurasjon
export interface AdminServerConfig {
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

class AdminServerConfigManager {
  private config: AdminServerConfig;

  constructor() {
    // Standard konfigurasjon for TMS admin
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
        dashboard: {
          url: process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000',
          endpoints: {
            health: '/api/admin/dashboard/health'
          }
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

  getServiceEndpoint(serviceName: string, endpointName: string): string | undefined {
    const service = this.config.services[serviceName];
    if (!service || !service.endpoints) return undefined;
    
    const endpoint = service.endpoints[endpointName];
    return endpoint ? `${service.url}${endpoint}` : undefined;
  }

  getHealthCheckUrls(): Record<string, string> {
    const healthChecks: Record<string, string> = {};
    
    // Backend health check
    healthChecks.backend = `${this.getBackendApiUrl()}/health`;
    
    // Service health checks
    Object.entries(this.config.services).forEach(([name, service]) => {
      if (service.endpoints?.health) {
        healthChecks[name] = `${service.url}${service.endpoints.health}`;
      }
    });
    
    return healthChecks;
  }
}

const adminServerConfigManager = new AdminServerConfigManager();
export default adminServerConfigManager; 
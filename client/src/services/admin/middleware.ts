import { AdminApiService, ApiResponse } from './api';

export interface MiddlewareConfig {
  security: {
    enabled: boolean;
    ipBlocking: boolean;
    threatDetection: boolean;
    rateLimiting: boolean;
    corsEnabled: boolean;
    helmetEnabled: boolean;
  };
  authentication: {
    jwtEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  logging: {
    level: string;
    requestLogging: boolean;
    errorLogging: boolean;
    auditLogging: boolean;
  };
  performance: {
    compressionEnabled: boolean;
    cachingEnabled: boolean;
    requestSizeLimit: string;
  };
}

export interface MiddlewareService {
  name: string;
  status: 'active' | 'disabled' | 'error';
  description: string;
  metrics: Record<string, any>;
  config: Record<string, any>;
}

export interface MiddlewareStatus {
  [key: string]: MiddlewareService;
}

export interface BlockedIP {
  ip: string;
  reason: string;
  count: number;
  blockedUntil: string;
  isExpired: boolean;
}

export interface MiddlewareLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  middleware: string;
  ip: string;
  userAgent: string;
}

export interface Middleware {
  id: string;
  name: string;
  type: 'authentication' | 'authorization' | 'logging' | 'rateLimit' | 'cors' | 'validation';
  enabled: boolean;
  order: number;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  requests: {
    total: number;
    success: number;
    failed: number;
    average_response_time: number;
  };
  lastModified: string;
}

export class MiddlewareApiService extends AdminApiService {
  private middlewareEndpoint = '/middleware';

  constructor() {
    super();
  }

  // Hent middleware-konfigurasjon
  async getConfig(): Promise<ApiResponse<MiddlewareConfig>> {
    return this.get(`${this.middlewareEndpoint}/config`);
  }

  // Oppdater middleware-konfigurasjon
  async updateConfig(config: Partial<MiddlewareConfig>): Promise<ApiResponse<MiddlewareConfig>> {
    return this.put(`${this.middlewareEndpoint}/config`, config);
  }

  // Hent status for alle middleware-tjenester
  async getStatus(): Promise<ApiResponse<MiddlewareStatus>> {
    return this.get(`${this.middlewareEndpoint}/status`);
  }

  // Toggle sikkerhetsmiddleware
  async toggleSecurity(enabled: boolean): Promise<ApiResponse<{ enabled: boolean }>> {
    return this.post(`${this.middlewareEndpoint}/security/toggle`, { enabled });
  }

  // Fjern alle IP-blokkeringer
  async clearSecurityBlocks(): Promise<ApiResponse<{ clearedCount: number }>> {
    return this.post(`${this.middlewareEndpoint}/security/clear-blocks`);
  }

  // Hent blokkerte IP-adresser
  async getBlockedIPs(): Promise<ApiResponse<BlockedIP[]>> {
    return this.get(`${this.middlewareEndpoint}/security/blocked-ips`);
  }

  // Fjern spesifikk IP-blokkering
  async unblockIP(ip: string): Promise<ApiResponse<{ ip: string; wasBlocked: boolean }>> {
    return this.delete(`${this.middlewareEndpoint}/security/blocked-ips/${ip}`);
  }

  // Hent middleware-logger
  async getLogs(level: string = 'info', limit: number = 100): Promise<ApiResponse<MiddlewareLog[]>> {
    return this.get(`${this.middlewareEndpoint}/logs?level=${level}&limit=${limit}`);
  }

  // Restart alle middleware-tjenester
  async restartServices(): Promise<ApiResponse<{ restartedAt: string; services: string[] }>> {
    return this.post(`${this.middlewareEndpoint}/restart`);
  }

  async getAllMiddleware(): Promise<ApiResponse<Middleware[]>> {
    try {
      // Return mock middleware for demo mode
      const mockMiddleware: Middleware[] = [
        {
          id: '1',
          name: 'Authentication Middleware',
          type: 'authentication',
          enabled: true,
          order: 1,
          config: {
            jwtSecret: '***',
            tokenExpiry: '24h',
            refreshTokenExpiry: '7d'
          },
          status: 'active',
          requests: {
            total: 45230,
            success: 44985,
            failed: 245,
            average_response_time: 12.5
          },
          lastModified: '2024-12-10T14:30:00Z'
        },
        {
          id: '2',
          name: 'Rate Limiting',
          type: 'rateLimit',
          enabled: true,
          order: 2,
          config: {
            windowMs: 900000,
            max: 100,
            skipSuccessfulRequests: false
          },
          status: 'active',
          requests: {
            total: 45230,
            success: 44890,
            failed: 340,
            average_response_time: 2.1
          },
          lastModified: '2024-12-08T10:15:00Z'
        },
        {
          id: '3',
          name: 'CORS Handler',
          type: 'cors',
          enabled: true,
          order: 3,
          config: {
            origin: ['http://localhost:3000', 'https://app.company.no'],
            credentials: true,
            optionsSuccessStatus: 200
          },
          status: 'active',
          requests: {
            total: 45230,
            success: 45230,
            failed: 0,
            average_response_time: 0.8
          },
          lastModified: '2024-12-05T16:45:00Z'
        },
        {
          id: '4',
          name: 'Request Validation',
          type: 'validation',
          enabled: false,
          order: 4,
          config: {
            strictMode: true,
            allowUnknownFields: false,
            stripUnknown: true
          },
          status: 'inactive',
          requests: {
            total: 0,
            success: 0,
            failed: 0,
            average_response_time: 0
          },
          lastModified: '2024-11-20T12:30:00Z'
        },
        {
          id: '5',
          name: 'Request Logger',
          type: 'logging',
          enabled: true,
          order: 5,
          config: {
            format: 'combined',
            level: 'info',
            logRotation: true,
            maxSize: '10MB'
          },
          status: 'active',
          requests: {
            total: 45230,
            success: 45230,
            failed: 0,
            average_response_time: 1.2
          },
          lastModified: '2024-12-12T09:20:00Z'
        }
      ];

      return {
        success: true,
        data: mockMiddleware
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: ['Failed to fetch middleware']
      };
    }
  }

  async getMiddleware(id: string): Promise<ApiResponse<Middleware>> {
    try {
      // Mock single middleware fetch
      const mockMiddleware: Middleware = {
        id,
        name: 'Authentication Middleware',
        type: 'authentication',
        enabled: true,
        order: 1,
        config: {
          jwtSecret: '***',
          tokenExpiry: '24h',
          refreshTokenExpiry: '7d'
        },
        status: 'active',
        requests: {
          total: 45230,
          success: 44985,
          failed: 245,
          average_response_time: 12.5
        },
        lastModified: '2024-12-10T14:30:00Z'
      };

      return {
        success: true,
        data: mockMiddleware
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Middleware,
        errors: ['Failed to fetch middleware']
      };
    }
  }

  async enableMiddleware(id: string): Promise<ApiResponse<Middleware>> {
    try {
      // Mock middleware enable
      const updatedMiddleware: Middleware = {
        id,
        name: 'Middleware Name',
        type: 'authentication',
        enabled: true,
        order: 1,
        config: {},
        status: 'active',
        requests: {
          total: 0,
          success: 0,
          failed: 0,
          average_response_time: 0
        },
        lastModified: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedMiddleware,
        message: 'Middleware enabled successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Middleware,
        errors: ['Failed to enable middleware']
      };
    }
  }

  async disableMiddleware(id: string): Promise<ApiResponse<Middleware>> {
    try {
      // Mock middleware disable
      const updatedMiddleware: Middleware = {
        id,
        name: 'Middleware Name',
        type: 'authentication',
        enabled: false,
        order: 1,
        config: {},
        status: 'inactive',
        requests: {
          total: 0,
          success: 0,
          failed: 0,
          average_response_time: 0
        },
        lastModified: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedMiddleware,
        message: 'Middleware disabled successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Middleware,
        errors: ['Failed to disable middleware']
      };
    }
  }

  async updateMiddleware(id: string, updates: Partial<Middleware>): Promise<ApiResponse<Middleware>> {
    try {
      // Mock middleware update
      const updatedMiddleware: Middleware = {
        id,
        name: updates.name || 'Middleware Name',
        type: updates.type || 'authentication',
        enabled: updates.enabled !== undefined ? updates.enabled : true,
        order: updates.order || 1,
        config: updates.config || {},
        status: updates.status || 'active',
        requests: updates.requests || {
          total: 0,
          success: 0,
          failed: 0,
          average_response_time: 0
        },
        lastModified: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedMiddleware,
        message: 'Middleware updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Middleware,
        errors: ['Failed to update middleware']
      };
    }
  }

  async reorderMiddleware(middlewareOrder: { id: string; order: number }[]): Promise<ApiResponse<Middleware[]>> {
    try {
      // Mock middleware reorder
      const updatedMiddleware: Middleware[] = middlewareOrder.map(item => ({
        id: item.id,
        name: 'Middleware Name',
        type: 'authentication' as const,
        enabled: true,
        order: item.order,
        config: {},
        status: 'active' as const,
        requests: {
          total: 0,
          success: 0,
          failed: 0,
          average_response_time: 0
        },
        lastModified: new Date().toISOString()
      }));

      return {
        success: true,
        data: updatedMiddleware,
        message: 'Middleware order updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: ['Failed to reorder middleware']
      };
    }
  }

  async getMiddlewareStats(): Promise<ApiResponse<{
    totalMiddleware: number;
    activeMiddleware: number;
    inactiveMiddleware: number;
    errorMiddleware: number;
    totalRequests: number;
    averageResponseTime: number;
  }>> {
    try {
      // Mock middleware stats
      const stats = {
        totalMiddleware: 5,
        activeMiddleware: 4,
        inactiveMiddleware: 1,
        errorMiddleware: 0,
        totalRequests: 45230,
        averageResponseTime: 3.32
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalMiddleware: 0,
          activeMiddleware: 0,
          inactiveMiddleware: 0,
          errorMiddleware: 0,
          totalRequests: 0,
          averageResponseTime: 0
        },
        errors: ['Failed to fetch middleware stats']
      };
    }
  }
}

export const middlewareService = new MiddlewareApiService(); 
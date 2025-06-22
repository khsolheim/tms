import { ApiResponse, Middleware, PaginationParams, PaginatedResponse } from '../types/admin';

// Export types for use in components
export type MiddlewareStatus = 'active' | 'disabled' | 'error';
export type MiddlewareConfig = {
  enabled: boolean;
  [key: string]: any;
};
export type BlockedIP = {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
};
export type MiddlewareLog = {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  middleware?: string;
};

class MiddlewareService {
  private baseUrl = 'http://localhost:4000/api/middleware';

  async getMiddleware(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Middleware>>> {
    try {
      // Return mock data for demo mode
      const mockMiddleware: Middleware[] = [
        {
          id: '1',
          name: 'Authentication Middleware',
          type: 'auth',
          status: 'active',
          order: 1,
          description: 'Handles user authentication and authorization',
          config: {
            enabled: true,
            timeout: 30000,
            maxRetries: 3
          },
          metrics: {
            requestCount: 15420,
            responseTime: 45,
            errorCount: 12,
            lastUsed: '2024-12-15T11:30:00Z'
          }
        },
        {
          id: '2',
          name: 'Rate Limiting',
          type: 'rate-limiting',
          status: 'active',
          order: 2,
          description: 'Controls request rate to prevent abuse',
          config: {
            enabled: true,
            maxRequests: 100,
            windowMs: 60000
          },
          metrics: {
            requestCount: 8934,
            responseTime: 12,
            errorCount: 45,
            lastUsed: '2024-12-15T11:25:00Z'
          }
        },
        {
          id: '3',
          name: 'CORS Handler',
          type: 'cors',
          status: 'active',
          order: 3,
          description: 'Manages Cross-Origin Resource Sharing',
          config: {
            enabled: true,
            origins: ['http://localhost:3000', 'https://tms.example.com'],
            credentials: true
          },
          metrics: {
            requestCount: 12567,
            responseTime: 8,
            errorCount: 2,
            lastUsed: '2024-12-15T11:32:00Z'
          }
        },
        {
          id: '4',
          name: 'Security Headers',
          type: 'security',
          status: 'active',
          order: 4,
          description: 'Adds security headers to responses',
          config: {
            enabled: true,
            hsts: true,
            xssProtection: true,
            contentTypeOptions: true
          },
          metrics: {
            requestCount: 15420,
            responseTime: 3,
            errorCount: 0,
            lastUsed: '2024-12-15T11:32:00Z'
          }
        },
        {
          id: '5',
          name: 'Request Logger',
          type: 'logging',
          status: 'disabled',
          order: 5,
          description: 'Logs all incoming requests for debugging',
          config: {
            enabled: false,
            logLevel: 'info',
            includeBody: false
          },
          metrics: {
            requestCount: 0,
            responseTime: 0,
            errorCount: 0,
            lastUsed: '2024-12-10T08:15:00Z'
          }
        }
      ];

      // Simple filtering based on search
      let filteredMiddleware = mockMiddleware;
      if (params.search) {
        filteredMiddleware = mockMiddleware.filter(middleware =>
          middleware.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          middleware.type.toLowerCase().includes(params.search!.toLowerCase())
        );
      }

      // Simple pagination
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      const paginatedData = filteredMiddleware.slice(start, end);

      return {
        success: true,
        data: {
          data: paginatedData,
          pagination: {
            page: params.page,
            limit: params.limit,
            total: filteredMiddleware.length,
            totalPages: Math.ceil(filteredMiddleware.length / params.limit),
            hasNextPage: end < filteredMiddleware.length,
            hasPreviousPage: params.page > 1
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          data: [],
          pagination: {
            page: params.page,
            limit: params.limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        },
        errors: ['Failed to fetch middleware']
      };
    }
  }

  async toggleMiddleware(id: string): Promise<ApiResponse<Middleware>> {
    try {
      // Mock toggle
      const mockMiddleware: Middleware = {
        id,
        name: 'Authentication Middleware',
        type: 'auth',
        status: 'active',
        order: 1,
        description: 'Handles user authentication and authorization',
        config: {
          enabled: true,
          timeout: 30000,
          maxRetries: 3
        },
        metrics: {
          requestCount: 15420,
          responseTime: 45,
          errorCount: 12,
          lastUsed: new Date().toISOString()
        }
      };

      return {
        success: true,
        data: mockMiddleware,
        message: 'Middleware status toggled successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Middleware,
        errors: ['Failed to toggle middleware']
      };
    }
  }

  async updateMiddlewareOrder(middlewareList: { id: string; order: number }[]): Promise<ApiResponse<boolean>> {
    try {
      // Mock order update
      return {
        success: true,
        data: true,
        message: 'Middleware order updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to update middleware order']
      };
    }
  }

  // Additional methods needed by MiddlewarePage
  async getStatus(): Promise<any> {
    return {
      success: true,
      data: {
        active: 4,
        disabled: 1,
        error: 0
      }
    };
  }

  async getConfig(): Promise<any> {
    return {
      success: true,
      data: {
        globalSettings: {
          enabled: true,
          timeout: 30000
        }
      }
    };
  }

  async getBlockedIPs(): Promise<ApiResponse<BlockedIP[]>> {
    return {
      success: true,
      data: [
        {
          ip: '192.168.1.100',
          reason: 'Too many failed login attempts',
          blockedAt: '2024-12-15T10:30:00Z',
          expiresAt: '2024-12-16T10:30:00Z'
        }
      ]
    };
  }

  async getLogs(level: string, limit: number): Promise<ApiResponse<MiddlewareLog[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          level: 'info' as const,
          message: 'Authentication middleware processed request',
          timestamp: '2024-12-15T11:30:00Z',
          middleware: 'auth'
        }
      ]
    };
  }

  async toggleSecurity(enabled: boolean): Promise<ApiResponse<boolean>> {
    return {
      success: true,
      data: enabled,
      message: `Security ${enabled ? 'enabled' : 'disabled'} successfully`
    };
  }

  async clearSecurityBlocks(): Promise<ApiResponse<boolean>> {
    return {
      success: true,
      data: true,
      message: 'Security blocks cleared successfully'
    };
  }

  async unblockIP(ip: string): Promise<ApiResponse<boolean>> {
    return {
      success: true,
      data: true,
      message: `IP ${ip} unblocked successfully`
    };
  }

  async restartServices(): Promise<ApiResponse<boolean>> {
    return {
      success: true,
      data: true,
      message: 'Services restarted successfully'
    };
  }

  async updateConfig(config: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: config,
      message: 'Configuration updated successfully'
    };
  }
}

const middlewareService = new MiddlewareService();
export { middlewareService };
export default middlewareService; 
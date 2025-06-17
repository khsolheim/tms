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
}

export const middlewareService = new MiddlewareApiService(); 
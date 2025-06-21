import { AdminApiService, ApiResponse } from './api';

export interface AuditLog {
  id: string;
  userId: number;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: string;
  details?: any;
}

export interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'suspicious_activity' | 'malware' | 'ddos' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  timestamp: string;
  status: 'active' | 'mitigated' | 'false_positive';
  actions: string[];
}

export interface AccessControl {
  id: string;
  userId: number;
  userName: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin: string;
  status: 'active' | 'inactive' | 'locked';
  failedLoginAttempts: number;
  ipWhitelist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
    preventReuse: number;
  };
  sessionSettings: {
    timeout: number;
    maxConcurrentSessions: number;
    requireReauth: boolean;
    rememberMe: boolean;
  };
  ipSecurity: {
    enableWhitelist: boolean;
    enableBlacklist: boolean;
    autoBlockSuspicious: boolean;
    blockDuration: number;
    maxFailedAttempts: number;
  };
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
    windowSize: number;
  };
  twoFactorAuth: {
    required: boolean;
    methods: ('sms' | 'email' | 'app')[];
    backupCodes: boolean;
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'basic' | 'detailed' | 'verbose';
  };
}

export interface IPAddress {
  ip: string;
  type: 'whitelist' | 'blacklist';
  reason: string;
  addedBy: string;
  addedAt: string;
  expiresAt?: string;
}

export class SecurityService extends AdminApiService {

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<AuditLog[]>> {
    return this.get<AuditLog[]>('/security/audit-logs', { params });
  }

  async getSecurityThreats(params?: {
    page?: number;
    limit?: number;
    type?: string;
    severity?: string;
    status?: string;
  }): Promise<ApiResponse<SecurityThreat[]>> {
    return this.get<SecurityThreat[]>('/security/threats', { params });
  }

  async getAccessControl(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<AccessControl[]>> {
    return this.get<AccessControl[]>('/security/access-control', { params });
  }

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    return this.get<SecuritySettings>('/security/settings');
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> {
    return this.put<SecuritySettings>('/security/settings', settings);
  }

  async blockIP(ip: string, reason: string, duration?: number): Promise<ApiResponse<any>> {
    return this.post('/security/block-ip', { ip, reason, duration });
  }

  async unblockIP(ip: string): Promise<ApiResponse<any>> {
    return this.post('/security/unblock-ip', { ip });
  }

  async addToWhitelist(ip: string, reason: string): Promise<ApiResponse<any>> {
    return this.post('/security/whitelist-ip', { ip, reason });
  }

  async removeFromWhitelist(ip: string): Promise<ApiResponse<any>> {
    return this.post('/security/remove-whitelist-ip', { ip });
  }

  async getIPAddresses(type?: 'whitelist' | 'blacklist'): Promise<ApiResponse<IPAddress[]>> {
    return this.get<IPAddress[]>('/security/ip-addresses', { params: { type } });
  }

  async lockUser(userId: number, reason: string): Promise<ApiResponse<any>> {
    return this.post(`/security/users/${userId}/lock`, { reason });
  }

  async unlockUser(userId: number): Promise<ApiResponse<any>> {
    return this.post(`/security/users/${userId}/unlock`);
  }

  async resetUserPassword(userId: number, sendEmail = true): Promise<ApiResponse<any>> {
    return this.post(`/security/users/${userId}/reset-password`, { sendEmail });
  }

  async updateUserPermissions(userId: number, permissions: string[]): Promise<ApiResponse<any>> {
    return this.put(`/security/users/${userId}/permissions`, { permissions });
  }

  async mitigateThreat(threatId: string, action: string): Promise<ApiResponse<any>> {
    return this.post(`/security/threats/${threatId}/mitigate`, { action });
  }

  async markThreatAsFalsePositive(threatId: string): Promise<ApiResponse<any>> {
    return this.post(`/security/threats/${threatId}/false-positive`);
  }

  async getSecurityReport(timeRange = '30d'): Promise<ApiResponse<any>> {
    return this.get('/security/reports', { params: { timeRange } });
  }

  async exportAuditLogs(params: {
    dateFrom: string;
    dateTo: string;
    format: 'csv' | 'json' | 'pdf';
  }): Promise<ApiResponse<any>> {
    return this.post('/security/audit-logs/export', params);
  }

  async testSecurityConfiguration(): Promise<ApiResponse<any>> {
    return this.post('/security/test-configuration');
  }

  async enableTwoFactorAuth(userId: number): Promise<ApiResponse<any>> {
    return this.post(`/security/users/${userId}/enable-2fa`);
  }

  async disableTwoFactorAuth(userId: number): Promise<ApiResponse<any>> {
    return this.post(`/security/users/${userId}/disable-2fa`);
  }

  async testSecurityConnection(): Promise<ApiResponse<{ success: boolean; error?: string }>> {
    return this.get('/security/test-connection');
  }

  async generateApiKey(): Promise<ApiResponse<string>> {
    return this.post('/security/generate-api-key');
  }
}

export const securityService = new SecurityService();
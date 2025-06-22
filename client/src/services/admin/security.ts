import { AdminApiService } from './api';
import { 
  SecurityEvent, 
  ThreatAlert, 
  AuditLog, 
  SecuritySettings, 
  AccessControl, 
  ApiResponse,
  PaginatedResponse
} from '../../types/admin';

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

export interface IPAddress {
  ip: string;
  type: 'whitelist' | 'blacklist';
  reason: string;
  addedBy: string;
  addedAt: string;
  expiresAt?: string;
}

export class SecurityService extends AdminApiService {
  private baseUrl = 'http://localhost:4000/api/admin/security';

  async getSecurityEvents(): Promise<ApiResponse<SecurityEvent[]>> {
    try {
      // Return mock security events for demo mode
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'failed_login',
          severity: 'medium',
          action: 'Multiple failed login attempts detected',
          timestamp: '2024-12-15T10:15:00Z',
          ipAddress: '192.168.1.100',
          userName: 'john@acme.com',
          details: {
            attempts: 5,
            timeWindow: '5 minutes'
          }
        },
        {
          id: '2',
          type: 'data_access',
          severity: 'high',
          action: 'Unusual access pattern detected',
          timestamp: '2024-12-15T09:30:00Z',
          ipAddress: '203.0.113.42',
          userName: 'admin@system.no',
          details: {
            pattern: 'Multiple location access',
            locations: ['Oslo', 'Bergen', 'Trondheim']
          }
        },
        {
          id: '3',
          type: 'permission_denied',
          severity: 'critical',
          action: 'Unauthorized privilege escalation attempt',
          timestamp: '2024-12-15T08:45:00Z',
          ipAddress: '192.168.1.250',
          userName: 'user@company.no',
          details: {
            attemptedRole: 'ADMIN',
            currentRole: 'BRUKER'
          }
        }
      ];

      return {
        success: true,
        data: mockEvents
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: ['Failed to fetch security events']
      };
    }
  }

  async getSecurityThreats(params: any): Promise<ApiResponse<any>> {
    // Delegate to getThreatAlerts for compatibility
    return this.getThreatAlerts();
  }

  async getThreatAlerts(): Promise<ApiResponse<ThreatAlert[]>> {
    try {
      // Mock threat alerts
      const mockThreatAlerts: ThreatAlert[] = [
        {
          id: '1',
          type: 'brute_force',
          severity: 'high',
          status: 'active',
          title: 'Brute Force Attack Detected',
          description: 'Multiple failed login attempts detected from IP 192.168.1.100',
          source: 'Authentication System',
          sourceIp: '192.168.1.100',
          targetResource: 'Login API',
          affectedResource: 'User Authentication',
          affectedUsers: ['john@acme.com', 'jane@acme.com'],
          mitigationActions: ['Block IP', 'Notify Admin', 'Reset User Passwords'],
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          riskScore: 85,
          actions: ['Block IP Address', 'Notify Security Team'],
        },
        {
          id: '2',
          type: 'suspicious_activity',
          severity: 'critical',
          status: 'resolved',
          title: 'Suspicious File Upload',
          description: 'Potential malware detected in uploaded file',
          source: 'File Scanner',
          sourceIp: '10.0.0.50',
          targetResource: 'File Upload API',
          affectedResource: 'Document Storage',
          affectedUsers: ['upload@company.no'],
          mitigationActions: ['Quarantine File', 'Scan System', 'Alert User'],
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          riskScore: 95,
          actions: ['Quarantine File', 'Run Full System Scan'],
        }
      ];

      return {
        success: true,
        data: mockThreatAlerts
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: ['Failed to fetch threat alerts']
      };
    }
  }

  async getAuditLogs(params: { page: number; limit: number; startDate?: string; endDate?: string; userId?: string; action?: string }): Promise<ApiResponse<{ logs: AuditLog[]; total: number }>> {
    try {
      // Return mock audit logs for demo mode
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: '2024-12-15T10:30:00Z',
          userId: '1',
          userName: 'John Doe',
          action: 'USER_LOGIN',
          resource: 'Authentication System',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          success: true,
          details: {
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            success: true
          }
        },
        {
          id: '2',
          timestamp: '2024-12-15T10:25:00Z',
          userId: '2',
          userName: 'Jane Smith',
          action: 'USER_CREATE',
          resource: 'User Management',
          ipAddress: '192.168.1.110',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          success: true,
          details: {
            targetUserId: '5',
            targetUserEmail: 'new@company.no',
            role: 'BRUKER'
          }
        }
      ];

      // Simple pagination
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      const paginatedLogs = mockLogs.slice(start, end);

      return {
        success: true,
        data: {
          logs: paginatedLogs,
          total: mockLogs.length
        }
      };
    } catch (error) {
      return {
        success: false,
        data: { logs: [], total: 0 },
        errors: ['Failed to fetch audit logs']
      };
    }
  }

  async getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    try {
      // Return mock security settings for demo mode
      const mockSettings: SecuritySettings = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          maxAge: 90,
          preventReuse: 5
        },
        sessionSettings: {
          timeout: 480,
          maxDuration: 480,
          idleTimeout: 30,
          requireReauth: true,
          maxConcurrentSessions: 3
        },
        accessControl: {
          maxFailedAttempts: 5,
          lockoutDuration: 15,
          ipWhitelist: ['192.168.1.0/24'],
          geoBlocking: true,
          allowedCountries: ['NO', 'SE', 'DK']
        },
        ipSecurity: {
          whitelist: ['192.168.1.0/24'],
          blacklist: [],
          enabled: true
        },
        rateLimiting: {
          enabled: true,
          maxRequests: 100,
          windowMinutes: 15
        },
        twoFactorAuth: {
          enabled: true,
          required: false,
          methods: ['TOTP', 'SMS'],
          enforced: false,
          allowedMethods: ['TOTP', 'SMS'],
          backupCodes: true
        },
        auditLogging: {
          enabled: true,
          retention: 365,
          logFailedAttempts: true
        },
        auditSettings: {
          logLevel: 'INFO',
          retentionDays: 365,
          realTimeAlerts: true,
          exportEnabled: true
        }
      };

      return {
        success: true,
        data: mockSettings
      };
    } catch (error) {
      return {
        success: false,
        data: {} as SecuritySettings,
        errors: ['Failed to fetch security settings']
      };
    }
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<ApiResponse<SecuritySettings>> {
    try {
      // Mock settings update
      const updatedSettings: SecuritySettings = {
        passwordPolicy: {
          minLength: settings.passwordPolicy?.minLength || 8,
          requireUppercase: settings.passwordPolicy?.requireUppercase || true,
          requireLowercase: settings.passwordPolicy?.requireLowercase || true,
          requireNumbers: settings.passwordPolicy?.requireNumbers || true,
          requireSpecialChars: settings.passwordPolicy?.requireSpecialChars || true,
          maxAge: settings.passwordPolicy?.maxAge || 90,
          preventReuse: settings.passwordPolicy?.preventReuse || 5
        },
        sessionSettings: {
          timeout: settings.sessionSettings?.timeout || 480,
          maxDuration: settings.sessionSettings?.maxDuration || 480,
          idleTimeout: settings.sessionSettings?.idleTimeout || 30,
          requireReauth: settings.sessionSettings?.requireReauth || true,
          maxConcurrentSessions: settings.sessionSettings?.maxConcurrentSessions || 3
        },
        accessControl: {
          maxFailedAttempts: settings.accessControl?.maxFailedAttempts || 5,
          lockoutDuration: settings.accessControl?.lockoutDuration || 15,
          ipWhitelist: settings.accessControl?.ipWhitelist || ['192.168.1.0/24'],
          geoBlocking: settings.accessControl?.geoBlocking || true,
          allowedCountries: settings.accessControl?.allowedCountries || ['NO', 'SE', 'DK']
        },
        ipSecurity: {
          whitelist: settings.ipSecurity?.whitelist || ['192.168.1.0/24'],
          blacklist: settings.ipSecurity?.blacklist || [],
          enabled: settings.ipSecurity?.enabled || true
        },
        rateLimiting: {
          enabled: settings.rateLimiting?.enabled || true,
          maxRequests: settings.rateLimiting?.maxRequests || 100,
          windowMinutes: settings.rateLimiting?.windowMinutes || 15
        },
        twoFactorAuth: {
          enabled: settings.twoFactorAuth?.enabled || true,
          required: settings.twoFactorAuth?.required || false,
          methods: settings.twoFactorAuth?.methods || ['TOTP', 'SMS'],
          enforced: settings.twoFactorAuth?.enforced || false,
          allowedMethods: settings.twoFactorAuth?.allowedMethods || ['TOTP', 'SMS'],
          backupCodes: settings.twoFactorAuth?.backupCodes || true
        },
        auditLogging: {
          enabled: settings.auditLogging?.enabled || true,
          retention: settings.auditLogging?.retention || 365,
          logFailedAttempts: settings.auditLogging?.logFailedAttempts || true
        },
        auditSettings: {
          logLevel: settings.auditSettings?.logLevel || 'INFO',
          retentionDays: settings.auditSettings?.retentionDays || 365,
          realTimeAlerts: settings.auditSettings?.realTimeAlerts || true,
          exportEnabled: settings.auditSettings?.exportEnabled || true
        }
      };

      return {
        success: true,
        data: updatedSettings,
        message: 'Security settings updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as SecuritySettings,
        errors: ['Failed to update security settings']
      };
    }
  }

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock alert acknowledgment
      return {
        success: true,
        data: true,
        message: 'Alert acknowledged successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to acknowledge alert']
      };
    }
  }

  async dismissAlert(alertId: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock alert dismissal
      return {
        success: true,
        data: true,
        message: 'Alert dismissed successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to dismiss alert']
      };
    }
  }

  async blockIP(ipAddress: string, reason: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock IP blocking
      return {
        success: true,
        data: true,
        message: 'IP address blocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to block IP address']
      };
    }
  }

  async unblockIP(ipAddress: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock IP unblocking
      return {
        success: true,
        data: true,
        message: 'IP address unblocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to unblock IP address']
      };
    }
  }

  async exportAuditLogs(params: { startDate: string; endDate: string; format: 'csv' | 'json' }): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      // Mock export
      return {
        success: true,
        data: {
          downloadUrl: '/api/admin/security/audit-logs/export/mock-export-id.csv'
        },
        message: 'Audit logs export initiated successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: { downloadUrl: '' },
        errors: ['Failed to export audit logs']
      };
    }
  }

  async mitigateThreat(threatId: string, action: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock threat mitigation
      console.log(`Mitigating threat ${threatId} with action: ${action}`);
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to mitigate threat']
      };
    }
  }

  async markThreatAsFalsePositive(threatId: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock false positive marking
      console.log(`Marking threat ${threatId} as false positive`);
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to mark threat as false positive']
      };
    }
  }

  async getAccessControl(params: any): Promise<ApiResponse<PaginatedResponse<AccessControl>>> {
    try {
      // Mock access control data
      const mockAccessControl: AccessControl[] = [
        {
          id: '1',
          userId: '1',
          navn: 'John Doe',
          userName: 'john.doe',
          epost: 'john@acme.com',
          email: 'john@acme.com',
          rolle: 'ADMIN',
          status: 'active',
          failedLoginAttempts: 0,
          lastLogin: '2024-12-15T10:30:00Z',
          permissions: ['USER_READ', 'USER_WRITE', 'ADMIN_READ']
        },
        {
          id: '2',
          userId: '2',
          navn: 'Jane Smith',
          userName: 'jane.smith',
          epost: 'jane@company.no',
          email: 'jane@company.no',
          rolle: 'HR_MANAGER',
          status: 'active',
          failedLoginAttempts: 1,
          lastLogin: '2024-12-15T09:15:00Z',
          permissions: ['USER_READ', 'USER_WRITE', 'HR_READ']
        },
        {
          id: '3',
          userId: '3',
          navn: 'Bob Wilson',
          userName: 'bob.wilson',
          epost: 'bob@company.no',
          email: 'bob@company.no',
          rolle: 'INSTRUCTOR',
          status: 'locked',
          failedLoginAttempts: 5,
          lastLogin: '2024-12-14T16:45:00Z',
          permissions: ['USER_READ', 'COURSE_READ', 'COURSE_WRITE']
        }
      ];

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = mockAccessControl.slice(startIndex, endIndex);

      const response: PaginatedResponse<AccessControl> = {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: mockAccessControl.length,
          totalPages: Math.ceil(mockAccessControl.length / limit),
          hasNextPage: endIndex < mockAccessControl.length,
          hasPreviousPage: page > 1
        }
      };

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        },
        errors: ['Failed to fetch access control data']
      };
    }
  }

  async lockUser(userId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log(`Locking user ${userId}`);
      return {
        success: true,
        data: true,
        message: 'User locked successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to lock user']
      };
    }
  }

  async unlockUser(userId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log(`Unlocking user ${userId}`);
      return {
        success: true,
        data: true,
        message: 'User unlocked successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to unlock user']
      };
    }
  }

  async resetUserPassword(userId: string): Promise<ApiResponse<boolean>> {
    try {
      console.log(`Resetting password for user ${userId}`);
      return {
        success: true,
        data: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to reset password']
      };
    }
  }
}

export const securityService = new SecurityService();
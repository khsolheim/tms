import api from '../lib/api';

// Interfaces
export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  warningEvents: number;
  failedLogins: number;
  successfulLogins: number;
  uniqueUsers: number;
  uniqueIPs: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'SYSTEM' | 'DATA' | 'API';
  user?: string;
  ipAddress: string;
  userAgent?: string;
  action: string;
  resource?: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface SecurityLogFilters {
  level?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  user?: string;
  ipAddress?: string;
  page?: number;
  limit?: number;
}

export interface SecurityLogResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  totalPages: number;
  metrics: SecurityMetrics;
}

export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
  threatCount: number;
  isActive: boolean;
}

export interface SecurityStatus {
  threatDetectionEnabled: boolean;
  ipBlockingEnabled: boolean;
  rateLimitingEnabled: boolean;
  corsEnabled: boolean;
  helmetEnabled: boolean;
  blockedIPs: number;
  activeThreats: number;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

class SecurityService {
  // Hent sikkerhetsmålinger og logger
  async hentSikkerhetslogs(filters: SecurityLogFilters = {}): Promise<SecurityLogResponse> {
    const searchParams = new URLSearchParams();
    
    if (filters.level) searchParams.append('level', filters.level);
    if (filters.category) searchParams.append('category', filters.category);
    if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
    if (filters.user) searchParams.append('user', filters.user);
    if (filters.ipAddress) searchParams.append('ipAddress', filters.ipAddress);
    if (filters.page) searchParams.append('page', filters.page.toString());
    if (filters.limit) searchParams.append('limit', filters.limit.toString());
    
    const queryString = searchParams.toString();
    const url = `/security/logs${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data.data;
  }

  // Hent sikkerhetsstatus
  async hentSikkerhetsstatus(): Promise<SecurityStatus> {
    const response = await api.get('/security/status');
    return response.data.data;
  }

  // Hent blokkerte IP-adresser
  async hentBlokkerteIPs(): Promise<BlockedIP[]> {
    const response = await api.get('/security/blocked-ips');
    return response.data.data.blockedIPs;
  }

  // Blokker IP-adresse
  async blokkerIP(ip: string, reason: string, duration?: number): Promise<void> {
    await api.post('/security/block-ip', { ip, reason, duration });
  }

  // Opphev blokkering av IP
  async opphevBlokkering(ip: string): Promise<void> {
    await api.delete(`/security/blocked-ips/${ip}`);
  }

  // Eksporter sikkerhetslogs
  async eksporterLogs(filters: SecurityLogFilters = {}, format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });
    
    searchParams.append('format', format);
    
    const response = await api.get(`/security/logs/export?${searchParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Mock data for utvikling (fjernes når API er ferdig)
  async hentMockData(): Promise<{
    metrics: SecurityMetrics;
    logs: LogEntry[];
  }> {
    // Simuler API-kall
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockMetrics: SecurityMetrics = {
      totalEvents: 1247,
      criticalEvents: 3,
      warningEvents: 18,
      failedLogins: 12,
      successfulLogins: 235,
      uniqueUsers: 47,
      uniqueIPs: 89
    };

    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: '2025-06-14T14:30:22Z',
        level: 'CRITICAL',
        category: 'AUTHENTICATION',
        user: 'admin@tms.no',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        action: 'FAILED_LOGIN_BRUTE_FORCE',
        resource: '/api/auth/login',
        details: 'Multiple failed login attempts detected from same IP',
        metadata: { attempts: 5, blocked: true }
      },
      {
        id: '2',
        timestamp: '2025-06-14T14:25:15Z',
        level: 'WARNING',
        category: 'AUTHORIZATION',
        user: 'lars.olsen@bedrift.no',
        ipAddress: '10.0.0.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resource: '/innstillinger/system/database',
        details: 'User attempted to access admin resource without sufficient privileges',
        metadata: { userRole: 'ELEV', requiredRole: 'ADMIN' }
      },
      {
        id: '3',
        timestamp: '2025-06-14T14:20:33Z',
        level: 'INFO',
        category: 'AUTHENTICATION',
        user: 'kari.hansen@transport.no',
        ipAddress: '203.45.67.89',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        action: 'SUCCESSFUL_LOGIN',
        resource: '/api/auth/login',
        details: 'User successfully authenticated',
        metadata: { method: '2FA', loginTime: 1.2 }
      },
      {
        id: '4',
        timestamp: '2025-06-14T14:15:47Z',
        level: 'ERROR',
        category: 'SYSTEM',
        ipAddress: '192.168.1.10',
        action: 'DATABASE_CONNECTION_ERROR',
        resource: '/api/bedrifter',
        details: 'Database connection timeout after 30 seconds',
        metadata: { timeout: 30000, retries: 3 }
      }
    ];

    return { metrics: mockMetrics, logs: mockLogs };
  }
}

export const securityService = new SecurityService();
export default securityService; 
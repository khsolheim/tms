import { ApiResponse, Alert, SystemHealth } from '../types/admin';

class DashboardService {
  private baseUrl = 'http://localhost:4000/api/dashboard';

  async getAlerts(): Promise<ApiResponse<Alert[]>> {
    try {
      // Mock alerts data
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Høy CPU-bruk',
          message: 'Server CPU-bruk er over 85%',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          severity: 'high'
        },
        {
          id: '2',
          type: 'error',
          title: 'Database tilkobling feilet',
          message: 'Kan ikke koble til primær database',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          acknowledged: false,
          severity: 'critical'
        },
        {
          id: '3',
          type: 'info',
          title: 'Planlagt vedlikehold',
          message: 'Systemvedlikehold planlagt for i morgen kl 02:00',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          acknowledged: true,
          severity: 'low'
        }
      ];

      return {
        success: true,
        data: mockAlerts
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: ['Failed to fetch alerts']
      };
    }
  }

  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    try {
      // Mock system health data
      const mockSystemHealth: SystemHealth = {
        database: {
          status: 'healthy',
          connections: 15,
          maxConnections: 100,
          responseTime: 45
        },
        api: {
          status: 'healthy',
          responseTime: 120,
          requestsPerMinute: 450,
          errorRate: 0.02
        },
        services: [
          {
            name: 'Authentication Service',
            status: 'healthy',
            port: 3001,
            uptime: 99.8
          },
          {
            name: 'Bedrift Service',
            status: 'healthy',
            port: 3002,
            uptime: 99.9
          },
          {
            name: 'Email Service',
            status: 'warning',
            port: 3003,
            uptime: 98.5
          }
        ],
        memory: {
          used: 2.4,
          total: 8.0,
          percentage: 30
        },
        cpu: {
          usage: 75,
          cores: 4
        }
      };

      return {
        success: true,
        data: mockSystemHealth
      };
    } catch (error) {
      return {
        success: false,
        data: {} as SystemHealth,
        errors: ['Failed to fetch system health']
      };
    }
  }

  async resolveAlert(alertId: string): Promise<ApiResponse<boolean>> {
    try {
      // Mock resolve alert
      return {
        success: true,
        data: true,
        message: 'Alert resolved successfully'
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        errors: ['Failed to resolve alert']
      };
    }
  }
}

const dashboardService = new DashboardService();
export { dashboardService };
export default dashboardService; 
import { AdminApiService, ApiResponse } from './api';
import { SystemHealth, SystemStats, ActivityItem, Alert, QuickAction } from '../../types/admin/admin';

export class DashboardService extends AdminApiService {
  
  async getOverview(): Promise<ApiResponse<SystemStats>> {
    return this.get<SystemStats>('/stats/overview');
  }

  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return this.get<SystemHealth>('/system/health');
  }

  async getRecentActivity(limit = 20): Promise<ApiResponse<ActivityItem[]>> {
    return this.get<ActivityItem[]>('/activity/recent', { params: { limit } });
  }

  async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.get<Alert[]>('/alerts/active');
  }

  async getQuickActions(): Promise<ApiResponse<QuickAction[]>> {
    return this.get<QuickAction[]>('/quick-actions');
  }

  async executeQuickAction(actionId: string, params?: any): Promise<ApiResponse<any>> {
    return this.post(`/quick-actions/${actionId}/execute`, params);
  }

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<any>> {
    return this.post(`/alerts/${alertId}/acknowledge`);
  }

  async dismissAlert(alertId: string): Promise<ApiResponse<any>> {
    return this.post(`/alerts/${alertId}/dismiss`);
  }

  async getPerformanceMetrics(timeRange = '24h'): Promise<ApiResponse<any>> {
    return this.get('/performance/metrics', { params: { timeRange } });
  }

  async getSystemLogs(level = 'all', limit = 100): Promise<ApiResponse<any[]>> {
    return this.get('/system/logs', { params: { level, limit } });
  }

  async restartService(serviceName: string): Promise<ApiResponse<any>> {
    return this.post(`/system/services/${serviceName}/restart`);
  }

  async clearCache(cacheType = 'all'): Promise<ApiResponse<any>> {
    return this.post('/system/cache/clear', { type: cacheType });
  }

  async enableMaintenanceMode(): Promise<ApiResponse<any>> {
    return this.post('/system/maintenance/enable');
  }

  async disableMaintenanceMode(): Promise<ApiResponse<any>> {
    return this.post('/system/maintenance/disable');
  }

  async exportSystemReport(format = 'pdf'): Promise<ApiResponse<any>> {
    return this.post('/reports/system/export', { format });
  }

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

export const dashboardService = new DashboardService();
export default dashboardService; 
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
}

export const dashboardService = new DashboardService(); 
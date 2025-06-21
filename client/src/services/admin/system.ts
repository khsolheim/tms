import { AdminApiService, ApiResponse } from './api';
import { BackupInfo, SystemLog, SystemConfiguration, PaginatedResponse, ApiParams } from '../../types/admin/admin';

class SystemService extends AdminApiService {
  async getSystemInfo(): Promise<any> {
    const response = await this.get('/admin/system/info');
    return response.data;
  }

  async getSystemConfiguration(): Promise<any> {
    const response = await this.get('/admin/system/configuration');
    return response.data;
  }

  async updateSystemConfiguration(config: Partial<SystemConfiguration>): Promise<ApiResponse<SystemConfiguration>> {
    return this.put<SystemConfiguration>('/system/configuration', config);
  }

  async getBackups(): Promise<BackupInfo[]> {
    const response = await this.get('/admin/system/backups');
    return response.data as BackupInfo[];
  }

  async createBackup(type: 'full' | 'incremental' | 'differential' = 'full'): Promise<BackupInfo> {
    const response = await this.post('/admin/system/backups', { type });
    return response.data as BackupInfo;
  }

  async performBackupAction(backupId: string, action: 'restore' | 'delete' | 'download'): Promise<void> {
    await this.post(`/admin/system/backups/${backupId}/${action}`);
  }

  async getLogs(params?: ApiParams): Promise<PaginatedResponse<SystemLog>> {
    const response = await this.get('/admin/system/logs', { params });
    return response.data as PaginatedResponse<SystemLog>;
  }

  async clearLogs(olderThanDays: number = 30): Promise<void> {
    await this.delete(`/admin/system/logs?olderThanDays=${olderThanDays}`);
  }

  async getSystemHealth(): Promise<any> {
    const response = await this.get('/admin/system/health');
    return response.data;
  }

  async restartService(serviceName: string): Promise<void> {
    await this.post(`/admin/system/services/${serviceName}/restart`);
  }

  async getScheduledTasks(): Promise<any[]> {
    const response = await this.get('/admin/system/scheduled-tasks');
    return response.data as any[];
  }

  async updateScheduledTask(taskId: string, enabled: boolean): Promise<void> {
    await this.put(`/admin/system/scheduled-tasks/${taskId}`, { enabled });
  }

  async runScheduledTask(taskId: string): Promise<void> {
    await this.post(`/admin/system/scheduled-tasks/${taskId}/run`);
  }

  async getSystemMetrics(timeRange: string = '1h'): Promise<any> {
    const response = await this.get('/admin/system/metrics', { params: { timeRange } });
    return response.data;
  }

  async getDatabaseStats(): Promise<any> {
    const response = await this.get('/admin/system/database/stats');
    return response.data;
  }

  async optimizeDatabase(): Promise<void> {
    await this.post('/admin/system/database/optimize');
  }

  async vacuumDatabase(): Promise<void> {
    await this.post('/admin/system/database/vacuum');
  }

  async testDatabaseConnection(): Promise<any> {
    const response = await this.get('/admin/system/database/test');
    return response.data;
  }

  async getSystemAlerts(): Promise<any[]> {
    const response = await this.get('/admin/system/alerts');
    return response.data as any[];
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.post(`/admin/system/alerts/${alertId}/acknowledge`);
  }

  async dismissAlert(alertId: string): Promise<void> {
    await this.delete(`/admin/system/alerts/${alertId}`);
  }

  async getMaintenanceMode(): Promise<{ enabled: boolean; message?: string }> {
    const response = await this.get('/admin/system/maintenance');
    return response.data as { enabled: boolean; message?: string };
  }

  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    await this.put('/admin/system/maintenance', { enabled, message });
  }

  async exportSystemData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await this.get('/admin/system/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data as Blob;
  }

  async importSystemData(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post('/admin/system/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getSystemVersion(): Promise<{ version: string; buildDate: string; gitHash: string }> {
    const response = await this.get('/admin/system/version');
    return response.data as { version: string; buildDate: string; gitHash: string };
  }

  async performSystemAction(action: string, params?: any): Promise<ApiResponse<any>> {
    return this.post(`/system/actions/${action}`, params);
  }

  async getSystemLogs(params?: {
    level?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<SystemLog[]>> {
    return this.get<SystemLog[]>('/system/logs', { params });
  }
}

export const systemService = new SystemService(); 
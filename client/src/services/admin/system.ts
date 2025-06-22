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
    // Mock data since backend is not available
    const mockBackups: BackupInfo[] = [
      {
        id: '1',
        filename: 'backup_full_2024-01-15.sql',
        type: 'full',
        size: 1024 * 1024 * 50, // 50MB
        timestamp: new Date().toISOString(),
        created: new Date().toISOString(),
        status: 'completed',
        duration: 120, // 2 minutes
        location: '/backups/backup_full_2024-01-15.sql',
        checksum: 'abc123def456',
        description: 'Full database backup'
      },
      {
        id: '2',
        filename: 'backup_incremental_2024-01-14.sql',
        type: 'incremental',
        size: 1024 * 1024 * 10, // 10MB
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        duration: 45,
        location: '/backups/backup_incremental_2024-01-14.sql',
        checksum: 'def456ghi789'
      },
      {
        id: '3',
        filename: 'backup_full_2024-01-13.sql',
        type: 'full',
        size: 1024 * 1024 * 48, // 48MB
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        created: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'failed',
        duration: 0,
        location: '/backups/backup_full_2024-01-13.sql',
        description: 'Backup failed due to disk space'
      }
    ];
    
    return mockBackups;
  }

  async createBackup(type: 'full' | 'incremental' | 'differential' = 'full'): Promise<BackupInfo> {
    const response = await this.post('/admin/system/backups', { type });
    return response.data as BackupInfo;
  }

  async performBackupAction(backupId: string, action: 'restore' | 'delete' | 'download'): Promise<void> {
    await this.post(`/admin/system/backups/${backupId}/${action}`);
  }

  async getLogs(params?: ApiParams): Promise<PaginatedResponse<SystemLog>> {
    // Mock data since backend is not available
    const mockLogs: SystemLog[] = [
      {
        id: '1',
        level: 'info',
        message: 'System started successfully',
        timestamp: new Date().toISOString(),
        source: 'system',
        metadata: { category: 'startup' }
      },
      {
        id: '2',
        level: 'warn',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        source: 'monitor',
        metadata: { category: 'performance' }
      },
      {
        id: '3',
        level: 'error',
        message: 'Database connection timeout',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        source: 'database',
        metadata: { category: 'connection' }
      }
    ];

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = mockLogs.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: mockLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
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
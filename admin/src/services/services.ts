import { AdminApiService, ApiResponse } from './api';
import { Service } from '../types/admin';

export class ServicesService extends AdminApiService {

  async getServices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<ApiResponse<Service[]>> {
    return this.get<Service[]>('/services', { params });
  }

  async getService(id: number): Promise<ApiResponse<Service>> {
    return this.get<Service>(`/services/${id}`);
  }

  async createService(service: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.post<Service>('/services', service);
  }

  async updateService(id: number, service: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.put<Service>(`/services/${id}`, service);
  }

  async deleteService(id: number): Promise<ApiResponse<any>> {
    return this.delete(`/services/${id}`);
  }

  async performServiceAction(id: number, action: 'start' | 'stop' | 'restart' | 'maintenance'): Promise<ApiResponse<any>> {
    return this.post(`/services/${id}/action`, { action });
  }

  async getServiceLogs(id: number, params?: {
    level?: string;
    limit?: number;
    since?: string;
  }): Promise<ApiResponse<any[]>> {
    return this.get(`/services/${id}/logs`, { params });
  }

  async getServiceMetrics(id: number, timeRange = '1h'): Promise<ApiResponse<any>> {
    return this.get(`/services/${id}/metrics`, { params: { timeRange } });
  }

  async getServiceHealth(id: number): Promise<ApiResponse<any>> {
    return this.get(`/services/${id}/health`);
  }

  async getServiceConfiguration(id: number): Promise<ApiResponse<any>> {
    return this.get(`/services/${id}/configuration`);
  }

  async updateServiceConfiguration(id: number, config: Record<string, any>): Promise<ApiResponse<any>> {
    return this.put(`/services/${id}/configuration`, config);
  }

  async getServiceDependencies(id: number): Promise<ApiResponse<any[]>> {
    return this.get(`/services/${id}/dependencies`);
  }

  async deployService(id: number, version: string): Promise<ApiResponse<any>> {
    return this.post(`/services/${id}/deploy`, { version });
  }

  async rollbackService(id: number, version: string): Promise<ApiResponse<any>> {
    return this.post(`/services/${id}/rollback`, { version });
  }

  async scaleService(id: number, replicas: number): Promise<ApiResponse<any>> {
    return this.post(`/services/${id}/scale`, { replicas });
  }

  async getServiceVersions(id: number): Promise<ApiResponse<any[]>> {
    return this.get(`/services/${id}/versions`);
  }

  async exportServiceLogs(id: number, params: {
    dateFrom: string;
    dateTo: string;
    format: 'csv' | 'json' | 'txt';
  }): Promise<ApiResponse<any>> {
    return this.post(`/services/${id}/logs/export`, params);
  }

  async getSystemOverview(): Promise<ApiResponse<any>> {
    return this.get('/services/system/overview');
  }

  async getServiceStats(): Promise<ApiResponse<any>> {
    return this.get('/services/stats');
  }

  async testServiceConnection(id: number): Promise<ApiResponse<{ success: boolean; error?: string }>> {
    return this.post(`/services/${id}/test-connection`);
  }

  async restartAllServices(): Promise<ApiResponse<any>> {
    return this.post('/services/restart-all');
  }

  async enableMaintenanceMode(): Promise<ApiResponse<any>> {
    return this.post('/services/maintenance-mode/enable');
  }

  async disableMaintenanceMode(): Promise<ApiResponse<any>> {
    return this.post('/services/maintenance-mode/disable');
  }
}

export const servicesService = new ServicesService(); 
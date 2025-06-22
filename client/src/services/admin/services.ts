import { AdminApiService, ApiResponse } from './api';
import { Service, ServiceMetrics, PaginatedResponse } from '../../types/admin';

export class ServicesService extends AdminApiService {

  async getServices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Service>>> {
    // Mock data since backend is not available
    const mockServices: Service[] = [
      {
        id: '1',
        navn: 'Auth Service',
        type: 'microservice',
        beskrivelse: 'Authentication and authorization service',
        status: 'ACTIVE',
        versjon: '1.2.3',
        port: 3001,
        aktiveBedrifter: 15,
        totalBrukere: 150,
        sistOppdatert: new Date().toISOString()
      },
      {
        id: '2',
        navn: 'User Management',
        type: 'api',
        beskrivelse: 'User management and profile service',
        status: 'ACTIVE',
        versjon: '2.1.0',
        port: 3002,
        aktiveBedrifter: 12,
        totalBrukere: 120,
        sistOppdatert: new Date().toISOString()
      },
      {
        id: '3',
        navn: 'Notification Service',
        type: 'microservice',
        beskrivelse: 'Email and SMS notification service',
        status: 'MAINTENANCE',
        versjon: '1.0.5',
        port: 3003,
        aktiveBedrifter: 8,
        totalBrukere: 80,
        sistOppdatert: new Date().toISOString()
      }
    ];

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = mockServices.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        data: mockServices,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    };
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

  async performServiceAction(id: string, action: 'start' | 'stop' | 'restart' | 'maintenance'): Promise<ApiResponse<any>> {
    return this.post(`/services/${id}/action`, { action });
  }

  async getServiceLogs(id: number, params?: {
    level?: string;
    limit?: number;
    since?: string;
  }): Promise<ApiResponse<any[]>> {
    return this.get(`/services/${id}/logs`, { params });
  }

  async getServiceMetrics(id: number, timeRange = '1h'): Promise<ApiResponse<ServiceMetrics>> {
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
import { AdminApiService, adminApi, ApiResponse } from './api';
import { Bedrift } from '../types/admin';
import { ApiParams, PaginatedResponse } from '../types/admin';

class BedrifterService extends AdminApiService {
  async getBedrifter(params?: ApiParams): Promise<ApiResponse<Bedrift[]>> {
    const response = await this.get('/admin/bedrifter', { params });
    const paginatedData = response.data as PaginatedResponse<Bedrift>;
    return {
      success: true,
      data: paginatedData.data,
      pagination: paginatedData.pagination
    };
  }

  async getBedrift(id: number): Promise<Bedrift> {
    const response = await this.get(`/admin/bedrifter/${id}`);
    return response.data as Bedrift;
  }

  async createBedrift(data: Partial<Bedrift>): Promise<Bedrift> {
    const response = await this.post('/admin/bedrifter', data);
    return response.data as Bedrift;
  }

  async updateBedrift(id: number, data: Partial<Bedrift>): Promise<Bedrift> {
    const response = await this.put(`/admin/bedrifter/${id}`, data);
    return response.data as Bedrift;
  }

  async deleteBedrift(id: number): Promise<void> {
    await this.delete(`/admin/bedrifter/${id}`);
  }

  async performBedriftAction(id: number, action: string): Promise<void> {
    await this.post(`/admin/bedrifter/${id}/action`, { action });
  }
}

export const bedrifterService = new BedrifterService(); 
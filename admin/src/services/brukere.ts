import { AdminApiService, ApiResponse } from './api';
import { Bruker, ApiParams, PaginatedResponse } from '../types/admin';

class BrukereService extends AdminApiService {
  async getBrukere(params?: ApiParams): Promise<ApiResponse<Bruker[]>> {
    const response = await this.get('/admin/brukere', { params });
    const paginatedData = response.data as PaginatedResponse<Bruker>;
    return {
      success: true,
      data: paginatedData.data,
      pagination: paginatedData.pagination
    };
  }

  async getBruker(id: number): Promise<Bruker> {
    const response = await this.get(`/admin/brukere/${id}`);
    return response.data as Bruker;
  }

  async createBruker(data: Partial<Bruker>): Promise<Bruker> {
    const response = await this.post('/admin/brukere', data);
    return response.data as Bruker;
  }

  async updateBruker(id: number, data: Partial<Bruker>): Promise<Bruker> {
    const response = await this.put(`/admin/brukere/${id}`, data);
    return response.data as Bruker;
  }

  async deleteBruker(id: number): Promise<void> {
    await this.delete(`/admin/brukere/${id}`);
  }

  async toggleBrukerStatus(id: number): Promise<void> {
    await this.post(`/admin/brukere/${id}/toggle-status`);
  }

  async getBrukerActivity(id: number): Promise<any[]> {
    const response = await this.get(`/admin/brukere/${id}/activity`);
    return response.data as any[];
  }

  async getBrukerSessions(id: number): Promise<any[]> {
    const response = await this.get(`/admin/brukere/${id}/sessions`);
    return response.data as any[];
  }

  async revokeBrukerSession(id: number, sessionId: string): Promise<void> {
    await this.delete(`/admin/brukere/${id}/sessions/${sessionId}`);
  }

  async getBrukerRoles(): Promise<any[]> {
    const response = await this.get('/admin/brukere/roles');
    return response.data as any[];
  }

  async updateBrukerRole(id: number, role: string): Promise<void> {
    await this.put(`/admin/brukere/${id}/role`, { role });
  }

  async getBrukerPermissions(id: number): Promise<any[]> {
    const response = await this.get(`/admin/brukere/${id}/permissions`);
    return response.data as any[];
  }

  async updateBrukerPermissions(id: number, permissions: string[]): Promise<void> {
    await this.put(`/admin/brukere/${id}/permissions`, { permissions });
  }

  async resetBrukerPassword(id: number): Promise<void> {
    await this.post(`/admin/brukere/${id}/reset-password`);
  }

  async lockBruker(id: number): Promise<void> {
    await this.post(`/admin/brukere/${id}/lock`);
  }

  async unlockBruker(id: number): Promise<void> {
    await this.post(`/admin/brukere/${id}/unlock`);
  }

  async exportBrukere(format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await this.get('/admin/brukere/export', {
      params: { format },
      responseType: 'blob'
    });
    return response.data as Blob;
  }

  async bulkImportBrukere(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use axios directly for multipart/form-data
    const response = await this.api.post('/admin/brukere/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async getBrukerAuditLog(id: number): Promise<any[]> {
    const response = await this.get(`/admin/brukere/${id}/audit`);
    return response.data as any[];
  }

  async lockInactiveUsers(days: number = 90): Promise<any> {
    const response = await this.post('/admin/brukere/lock-inactive', { days });
    return response.data;
  }

  async performBrukerAction(id: number, action: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'resetPassword' | 'delete'): Promise<void> {
    await this.post(`/admin/brukere/${id}/actions`, { action });
  }
}

export const brukereService = new BrukereService(); 
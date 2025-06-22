import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { PaginatedResponse } from '../../types/admin';

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class AdminApiService {
  protected api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    // Bruk serverConfigManager for backend URL
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
    
    this.api = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('adminRefreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const authServiceUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/auth/refresh`;
            const response = await axios.post(authServiceUrl || '/api/admin/auth/refresh', {
              refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem('adminToken', accessToken);
            localStorage.setItem('adminRefreshToken', newRefreshToken);
            this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            this.processQueue(null, accessToken);
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data: any = error.response.data;
      return {
        message: data.message || 'An error occurred',
        code: data.code,
        details: data.details,
      };
    }
    
    if (error.request) {
      return {
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      };
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  private handleAuthError() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Microservice methods
  async callMicroservice<T = any>(
    serviceName: string,
    endpoint: string,
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const serviceUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/${serviceName}/${endpoint}`;
    
    if (!serviceUrl) {
      throw new Error(`Service endpoint not found: ${serviceName}/${endpoint}`);
    }

    const response = await axios.request<T>({
      url: serviceUrl,
      method,
      data,
      ...config,
      headers: {
        ...config?.headers,
        Authorization: this.api.defaults.headers.common['Authorization'],
      },
    });

    return response.data;
  }

  // Health check
  async checkHealth(): Promise<Record<string, boolean>> {
    const healthChecks = {
      'database': `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/health/database`,
      'redis': `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/health/redis`,
      'storage': `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/health/storage`
    };
    const results: Record<string, boolean> = {};

    await Promise.all(
      Object.entries(healthChecks).map(async ([service, url]) => {
        try {
          await axios.get(url, { timeout: 5000 });
          results[service] = true;
        } catch {
          results[service] = false;
        }
      })
    );

    return results;
  }
}

export const adminApiService = new AdminApiService();
export const adminApi = adminApiService; // Alias for backwards compatibility
export default adminApiService; 
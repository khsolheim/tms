import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from '../utils/auth';
import serverConfigManager from '../config/server-config';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    // Bruk serverConfigManager for å få backend URL
    const baseURL = serverConfigManager.getBackendApiUrl();
    
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
        const token = getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Bruk serverConfigManager for auth service
            const authServiceUrl = serverConfigManager.getServiceEndpoint('auth', 'refresh');
            const response = await axios.post(authServiceUrl || '/api/auth/refresh', {
              refreshToken,
            });

            const { accessToken } = response.data;
            localStorage.setItem('authToken', accessToken);
            this.api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            this.processQueue(null, accessToken);

            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  // Spesifikke API-metoder for microservices
  async callMicroservice<T = any>(
    serviceName: string, 
    endpoint: string, 
    method: 'get' | 'post' | 'put' | 'delete' = 'get',
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const serviceUrl = serverConfigManager.getServiceEndpoint(serviceName, endpoint);
    
    if (!serviceUrl) {
      throw new Error(`Service endpoint not found: ${serviceName}/${endpoint}`);
    }

    switch (method) {
      case 'get':
        return axios.get<T>(serviceUrl, config);
      case 'post':
        return axios.post<T>(serviceUrl, data, config);
      case 'put':
        return axios.put<T>(serviceUrl, data, config);
      case 'delete':
        return axios.delete<T>(serviceUrl, config);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  // Health check for alle tjenester
  async checkServicesHealth(): Promise<Record<string, boolean>> {
    const healthChecks = serverConfigManager.getHealthCheckUrls();
    const results: Record<string, boolean> = {};

    await Promise.all(
      Object.entries(healthChecks).map(async ([service, url]: [string, string]) => {
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

// Export singleton instance
export const apiService = new ApiService();

// Export for backward compatibility
export default apiService; 
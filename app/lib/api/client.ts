import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiError {
  message: string;
  code?:   string;
  status?: number;
}

interface ApiResponse<T> {
  data:     T;
  success:  boolean;
  message?: string;
}

  type RefreshHandler = () => Promise<void>;

  class ApiClient {
    private client:       AxiosInstance;
    private isRefreshing = false;
    private failedQueue:  Array<{
      onSuccess: (token: string) => void;
      onFailed:  (error: Error) => void;
    }> = [];
    private accessToken: string | null = null;
    private onRefresh: RefreshHandler | null = null; // Delegated to refresh AuthContext

    constructor() {
      this.client = axios.create({
        baseURL:         API_BASE_URL,
        timeout:         90000,
        withCredentials: true, // ✅ always send cookies (refresh token)
        headers:         { 'Content-Type': 'application/json' },
      });

      this.client.interceptors.request.use(config => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      });

      this.client.interceptors.response.use(
        response => response,
        error    => this.handleError(error),
      );
    }
    setRefreshHandler(handler: () => Promise<void>) {
      this.onRefresh = handler;
    }
    // Called by AuthContext after login/register/refresh
    setAccessToken(token: string | null) {
      this.accessToken = token;
    }

    private processQueue(error: Error | null, token: string | null = null) {
      this.failedQueue.forEach(p => {
        if (error) p.onFailed(error);
        else if (token) p.onSuccess(token);
      });
      this.failedQueue = [];
    }


    private async handleError(error: AxiosError<any>) {
        const original = error.config as any;

        if (error.response?.status === 401 && !original._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                onSuccess: token => {
                  original.headers.Authorization = `Bearer ${token}`;
                  resolve(this.client(original));
                },
                onFailed: err => reject(err),
              });
            });
          }

          original._retry   = true;
          this.isRefreshing = true;

          try {
            if (!this.onRefresh) throw new Error('No refresh handler registered');

            await this.onRefresh(); // ✅ AuthContext handles the refresh + setAuth

            // By now AuthContext has called setAccessToken() with new token
            const newToken = this.accessToken;
            if (!newToken) throw new Error('Refresh succeeded but no token set');

            original.headers.Authorization = `Bearer ${newToken}`;
            this.processQueue(null, newToken);
            return this.client(original);
          } catch (err) {
            this.accessToken = null;
            this.processQueue(err as Error, null);
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.formatError(error));
      }

    private formatError(error: AxiosError<any>): ApiError {
      return {
        message: error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred',
        code:    error.response?.data?.code,
        status:  error.response?.status,
      };
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const res = await this.client.get<ApiResponse<T>>(url, config);
      return res.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const res = await this.client.post<ApiResponse<T>>(url, data, config);
      return res.data;
    }

    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const res = await this.client.put<ApiResponse<T>>(url, data, config);
      return res.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const res = await this.client.patch<ApiResponse<T>>(url, data, config);
      return res.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
      const res = await this.client.delete<ApiResponse<T>>(url, config);
      return res.data;
    }

    async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
      const formData = new FormData();
      formData.append('file', file);
      if (additionalData) {
        Object.entries(additionalData).forEach(([k, v]) => formData.append(k, v));
      }
      return this.post<T>(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    async uploadMultipleFiles<T>(url: string, files: File[], additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      if (additionalData) {
        Object.entries(additionalData).forEach(([k, v]) => formData.append(k, v));
      }
      return this.post<T>(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
  }

export const apiClient = new ApiClient();
export default apiClient;
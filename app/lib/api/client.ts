import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Route browser requests through Next's same-origin API rewrite. Calling the
// backend directly omits the session cookie for the frontend origin.
const API_BASE_URL = '/api';

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

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:         API_BASE_URL,
      timeout:         90000,
      withCredentials: true,   // sends Better Auth's session cookie automatically
      headers:         { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError<any>) => {
        // Session invalid/expired — hard redirect as a fallback for calls made
        // outside the React tree. AuthProvider's own getSession() call handles
        // the common in-app case; this just catches stragglers.
        const isProtectedPage =
          typeof window !== 'undefined' &&
          (
            window.location.pathname.startsWith('/admin') ||
            window.location.pathname.startsWith('/vendor') ||
            window.location.pathname.startsWith('/customer')
          );

        if (
          typeof window !== 'undefined' &&
          error.response?.status === 401 &&
          !error.config?.url?.includes('/auth/') &&
          isProtectedPage
        ) {
          const redirect = window.location.pathname + window.location.search;
          window.location.assign('/auth/login?redirect=' + encodeURIComponent(redirect));
        }
        return Promise.reject(this.formatError(error));
      },
    );
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

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Route browser requests through Next's same-origin API rewrite. Calling the
// backend directly omits the session cookie for the frontend origin.
const API_BASE_URL = '/api';

export interface ApiError {
  message: string;
  code?:   string;
  status?: number;
  /**
   * Field-level validation problems (422): `{ path: '/field', message }[]`.
   * Some 409s carry an object instead, e.g. DATES_BOOKED → `{ dates: [...] }`.
   */
  details?: { path: string; message: string }[] | { dates?: string[] };
}

interface ApiResponse<T> {
  data:     T;
  success:  boolean;
  message?: string;
  [extra: string]: unknown;
}

interface ErrorBody { error?: string; message?: string; code?: string; details?: ApiError['details'] }

type FormValue = string | number | boolean;

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
      (error: AxiosError<ErrorBody>) => {
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

  private formatError(error: AxiosError<ErrorBody>): ApiError {
    const body = error.response?.data;
    const status = error.response?.status;
    return {
      // 5xx and network failures get a generic message: never show internals.
      message: status !== undefined && status < 500
        ? (body?.error || body?.message || 'Request failed')
        : status === undefined ? 'Network error. Check your connection and try again.' : 'Something went wrong. Please try again.',
      code:    body?.code,
      status,
      details: body?.details,
    };
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.client.get<ApiResponse<T>>(url, config);
    return res.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.client.post<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.client.put<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.client.patch<ApiResponse<T>>(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const res = await this.client.delete<ApiResponse<T>>(url, config);
    return res.data;
  }

  /**
   * Multipart upload. Fields are appended BEFORE the files: the backend processes files as
   * they stream in, so a field after a file (e.g. `uploadType`) is rejected with 422.
   */
  async upload<T>(url: string, files: File | File[], fields: Record<string, FormValue> = {}): Promise<ApiResponse<T>> {
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) formData.append(k, String(v));
    for (const f of Array.isArray(files) ? files : [files]) formData.append('file', f);
    return this.post<T>(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

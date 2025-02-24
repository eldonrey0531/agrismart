import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig,
  AxiosResponse, 
  AxiosError,
  CreateAxiosDefaults
} from 'axios';
import { ErrorService, AppError } from './error-service';

// For client-side requests: use relative URLs in development, full URLs in production
const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use full URL with the correct port
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  }
  // Client-side: use relative URL
  return '/api/v1';
};

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type RequestConfig = Omit<InternalAxiosRequestConfig, 'headers'> & {
  headers?: Record<string, string>;
};

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    const config: CreateAxiosDefaults = {
      baseURL: getBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Don't throw on non-200 responses
      validateStatus: (status) => true,
    };

    this.axiosInstance = axios.create(config);

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Update base URL for each request in case environment changes
        config.baseURL = getBaseUrl();
        return config;
      },
      (error: Error | AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // If response is not successful (non-200 status), format error
        if (response.status !== 200) {
          throw ErrorService.createError(
            response.data?.error?.message || 'Request failed',
            response.data?.error?.code || 'API_ERROR',
            response.status
          );
        }
        return response;
      },
      (error: Error | AxiosError) => {
        if (axios.isAxiosError(error)) {
          return Promise.reject(ErrorService.handleApiError(error));
        }
        return Promise.reject(ErrorService.createError(error.message));
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  public async get<T>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<ApiResponse<T>>(
        url,
        config as InternalAxiosRequestConfig
      );
      if (!response.data.success) {
        throw ErrorService.createError(
          response.data.error?.message || 'Request failed',
          response.data.error?.code
        );
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw ErrorService.createError('Failed to fetch data');
    }
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<ApiResponse<T>>(
        url,
        data,
        config as InternalAxiosRequestConfig
      );
      if (!response.data.success) {
        throw ErrorService.createError(
          response.data.error?.message || 'Request failed',
          response.data.error?.code
        );
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw ErrorService.createError('Failed to create data');
    }
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<ApiResponse<T>>(
        url,
        data,
        config as InternalAxiosRequestConfig
      );
      if (!response.data.success) {
        throw ErrorService.createError(
          response.data.error?.message || 'Request failed',
          response.data.error?.code
        );
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw ErrorService.createError('Failed to update data');
    }
  }

  public async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<ApiResponse<T>>(
        url,
        config as InternalAxiosRequestConfig
      );
      if (!response.data.success) {
        throw ErrorService.createError(
          response.data.error?.message || 'Request failed',
          response.data.error?.code
        );
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw ErrorService.createError('Failed to delete data');
    }
  }
}

// Create singleton instance
export const marketplaceApi = ApiClient.getInstance();
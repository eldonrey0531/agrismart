import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * API response type
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * API filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * API client class
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response) {
          // Server responded with error
          throw {
            message: error.response.data.message || 'An error occurred',
            status: error.response.status,
            data: error.response.data
          };
        } else if (error.request) {
          // Request made but no response
          throw {
            message: 'No response from server',
            status: 503,
            data: null
          };
        } else {
          // Request setup error
          throw {
            message: error.message,
            status: 500,
            data: null
          };
        }
      }
    );
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get<any, T>(url, config);
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post<any, T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put<any, T>(url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch<any, T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete<any, T>(url, config);
  }

  /**
   * GET with pagination
   */
  async getPaginated<T>(
    url: string,
    params?: PaginationParams & FilterParams
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.get(url, { params });
  }
}

// Create and export API client instance
export const api = new ApiClient();
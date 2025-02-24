import { API_BASE, HTTP_STATUS, type ApiRequest } from "./constants";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Fetch options type
interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  // Build URL with query parameters
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Generic request method
  private async request<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.error || "An unknown error occurred",
          data.details
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }

  // HTTP method wrappers
  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(path: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(path: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(path: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  // File upload method
  async upload<T>(
    path: string,
    files: File | File[],
    data?: Record<string, any>,
    options?: FetchOptions
  ): Promise<T> {
    const formData = new FormData();

    // Append files
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });
    } else {
      formData.append("file", files);
    }

    // Append additional data
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: formData,
      headers: {
        ...options?.headers,
        // Don't set Content-Type, browser will set it with boundary
      },
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export types
export type { FetchOptions };
import axios, { AxiosInstance } from 'axios';
import { useState } from 'react';

interface APIConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

export const useAPI = (config: APIConfig = {}) => {
  const [instance] = useState<AxiosInstance>(() => {
    const api = axios.create({
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: true,
    });

    // Request interceptor
    api.interceptors.request.use(
      (config) => {
        // Add any request transformations (e.g., adding auth tokens)
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        // Handle common errors (401, 403, etc.)
        if (error.response?.status === 401) {
          // Handle unauthorized
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );

    return api;
  });

  return instance;
};

export default useAPI;
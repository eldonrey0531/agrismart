import { useState } from 'react';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import axios from '../utils/axios'; // We'll create this next

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export function useApi<T>(
  key: string[],
  url: string,
  options?: UseQueryOptions<ApiResponse<T>, AxiosError<ApiError>>
) {
  return useQuery<ApiResponse<T>, AxiosError<ApiError>>({
    queryKey: key,
    queryFn: async () => {
      const response = await axios.get<ApiResponse<T>>(url);
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, TVariables>
) {
  const [progress, setProgress] = useState(0);

  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, TVariables>({
    mutationFn: async (variables) => {
      const response = await axios.post<ApiResponse<TData>>(url, variables, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentage);
          }
        },
      });
      return response.data;
    },
    ...options,
  });
}

export function useApiPut<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, TVariables>
) {
  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, TVariables>({
    mutationFn: async (variables) => {
      const response = await axios.put<ApiResponse<TData>>(url, variables);
      return response.data;
    },
    ...options,
  });
}

export function useApiDelete<TData>(
  url: string,
  options?: UseMutationOptions<ApiResponse<TData>, AxiosError<ApiError>, void>
) {
  return useMutation<ApiResponse<TData>, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      const response = await axios.delete<ApiResponse<TData>>(url);
      return response.data;
    },
    ...options,
  });
}

// Helper to handle API errors
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      return Object.values(error.response.data.errors)
        .flat()
        .join(', ');
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
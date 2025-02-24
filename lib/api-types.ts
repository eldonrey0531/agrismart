import { User } from '@/types/auth';

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth response types
export interface AuthResponse extends ApiSuccessResponse<{
  user: User;
  token?: string;
}> {}

export interface UserResponse extends ApiSuccessResponse<{
  user: User;
}> {}

// Type guard to check if response is successful
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

// Type guard to check if response is an error
export function isErrorResponse(
  response: ApiResponse<any>
): response is ApiErrorResponse {
  return response.success === false;
}

// API endpoints - Using Next.js API routes
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    me: '/api/auth/me',
    refreshToken: '/api/auth/refresh',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
  },
  users: {
    profile: '/api/users/profile',
    settings: '/api/users/settings',
  },
} as const;

// API request configurations
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  withCredentials: boolean;
  headers: {
    'Content-Type': string;
    Accept: string;
  };
}

// Updated to use Next.js app URL from environment
export const DEFAULT_API_CONFIG: ApiConfig = {
  // For Next.js API routes, baseURL should be the app URL
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
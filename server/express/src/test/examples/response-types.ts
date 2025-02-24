/**
 * Base response types
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * User types
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth types
 */
export interface TokenResponse {
  token: string;
}

export interface LoginData {
  user: TestUser;
  token: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update types
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  user: TestUser;
}

/**
 * Type guards
 */
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> => response.success;

export const isErrorResponse = (
  response: ApiResponse
): response is ErrorResponse => !response.success;

export const isLoginResponse = (
  response: ApiResponse<unknown>
): response is SuccessResponse<LoginData> =>
  isSuccessResponse(response) &&
  typeof response.data === 'object' &&
  response.data !== null &&
  'user' in response.data &&
  'token' in response.data;

export const isTokenResponse = (
  response: ApiResponse<unknown>
): response is SuccessResponse<TokenResponse> =>
  isSuccessResponse(response) &&
  typeof response.data === 'object' &&
  response.data !== null &&
  'token' in response.data;

/**
 * Response creators
 */
export const createSuccessResponse = <T>(data: T): SuccessResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (
  type: string,
  message: string,
  data?: Record<string, unknown>
): ErrorResponse => ({
  success: false,
  type,
  message,
  ...(data && { data }),
});

export default {
  isSuccessResponse,
  isErrorResponse,
  isLoginResponse,
  isTokenResponse,
  createSuccessResponse,
  createErrorResponse,
};
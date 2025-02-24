import type { SetupOptions, UpdateOptions, CliOptions } from './utils.interface';
import type { ErrorUtils } from './test-errors';

/**
 * Error Types
 */
export interface ErrorDetails {
  type: string;
  message: string;
  status: number;
  data?: Record<string, unknown>;
}

export const ErrorType = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
} as const;

export type ErrorTypeValue = typeof ErrorType[keyof typeof ErrorType];

export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0,
} as const;

export type HttpStatusValue = typeof HttpStatus[keyof typeof HttpStatus];

/**
 * Response Types
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  type: ErrorTypeValue;
  message: string;
  data?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * User Types
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
 * Auth Types
 */
export interface LoginData {
  user: TestUser;
  token: string;
}

export interface TokenResponse {
  token: string;
}

/**
 * Request Types
 */
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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

/**
 * Config Types
 */
export interface TestConfig {
  api: {
    baseUrl: string;
    paths: ApiPaths;
    timeout: number;
  };
  rateLimiting: {
    maxAttempts: number;
    windowMs: number;
    blockDuration: number;
  };
  errors: ErrorMessages;
  defaultUser: TestUser;
  mockTokens: {
    valid: string;
    expired: string;
    invalid: string;
  };
  security: {
    headers: Record<string, string>;
  };
}

export interface ApiPaths {
  auth: {
    login: string;
    signup: string;
    logout: string;
    refresh: string;
    me: string;
  };
  users: {
    profile: string;
    password: string;
    settings: string;
  };
}

export interface ErrorMessages {
  auth: {
    invalidCredentials: string;
    accountLocked: string;
    rateLimitExceeded: string;
    invalidToken: string;
    expiredToken: string;
    sessionExpired: string;
    unauthorized: string;
  };
  validation: {
    invalid: (field: string) => string;
    required: (field: string) => string;
  };
  network: {
    timeout: string;
    connectionFailed: string;
  };
}

// Re-export utility interfaces
export type {
  SetupOptions,
  UpdateOptions,
  CliOptions,
};

// Export type utilities
export const Types = {
  isSuccess: <T>(response: ApiResponse<T>): response is SuccessResponse<T> =>
    response.success,
  isError: (response: ApiResponse): response is ErrorResponse =>
    !response.success,
  isErrorType: (type: string): type is ErrorTypeValue =>
    Object.values(ErrorType).includes(type as ErrorTypeValue),
  isHttpStatus: (status: number): status is HttpStatusValue =>
    Object.values(HttpStatus).includes(status as HttpStatusValue),
};

export default Types;
// Base HTTP response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST'
} as const;

// Response types
export interface SuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: ApiError;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

// Type guards
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> => {
  return response.success === true;
};

export const isErrorResponse = (
  response: ApiResponse
): response is ErrorResponse => {
  return response.success === false;
};

export const isValidationError = (
  error: ApiError
): error is ApiError & { details: ValidationError[] } => {
  return error.code === ERROR_CODES.VALIDATION;
};

// Type utilities
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Factory functions
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): SuccessResponse<T> => ({
  success: true,
  data,
  message
});

export const createErrorResponse = (
  error: ApiError
): ErrorResponse => ({
  success: false,
  error
});

export const createPaginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit)
});

export const createApiError = (
  code: ErrorCode,
  message: string,
  details?: Record<string, any>
): ApiError => ({
  code,
  message,
  details
});
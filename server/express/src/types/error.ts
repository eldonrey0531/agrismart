export type ErrorCode = 
  | 'INVALID_USER_DATA'
  | 'USER_PROCESSING_ERROR'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_IN_USE'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_INACTIVE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_PASSWORD'
  | 'EMAIL_ALREADY_VERIFIED'
  | 'USER_NOT_FOUND'
  | 'VALIDATION_ERROR';

export interface ErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  statusCode: number;
  data?: any;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 'FORBIDDEN', 403);
  }

  static notFound(message = 'Not found'): ApiError {
    return new ApiError(message, 'NOT_FOUND', 404);
  }

  static badRequest(message = 'Bad request', data?: any): ApiError {
    return new ApiError(message, 'BAD_REQUEST', 400, data);
  }

  static conflict(message = 'Conflict'): ApiError {
    return new ApiError(message, 'EMAIL_IN_USE', 409);
  }

  static validation(message = 'Validation error', data?: any): ApiError {
    return new ApiError(message, 'VALIDATION_ERROR', 400, data);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(message, 'RATE_LIMIT_EXCEEDED', 429);
  }

  toResponse(): ErrorResponse {
    return {
      success: false,
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      ...(this.data && { data: this.data })
    };
  }
}

export const handleError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(
      error.message || 'Internal server error',
      'BAD_REQUEST',
      500
    );
  }

  return new ApiError(
    'An unexpected error occurred',
    'BAD_REQUEST',
    500
  );
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
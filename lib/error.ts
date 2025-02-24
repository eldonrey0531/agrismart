import type { ApiErrorDetail } from '@/types/marketplace';

/**
 * API Error Response Interface
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
  details?: ApiErrorDetail[];
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusCode: number;
  readonly code?: string;
  readonly details?: ApiErrorDetail[];

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status; // For compatibility
    this.code = code;
    this.details = details;
  }

  /**
   * Create unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  /**
   * Create forbidden error
   */
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  /**
   * Create not found error
   */
  static notFound(message: string = 'Not Found'): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  /**
   * Create validation error
   */
  static validation(message: string, details: ApiErrorDetail[]): ApiError {
    return new ApiError(message, 400, 'VALIDATION_ERROR', details);
  }

  /**
   * Create bad request error
   */
  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(message, 400, code || 'BAD_REQUEST');
  }

  /**
   * Convert to response format
   */
  toResponse(): ApiErrorResponse {
    return {
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
    };
  }

  /**
   * Handle error conversion
   */
  static handle(error: unknown): ApiErrorResponse {
    if (error instanceof ApiError) {
      return error.toResponse();
    }

    // Handle validation errors
    if (error instanceof Error) {
      return new ApiError(
        error.message || 'An error occurred',
        500,
        'INTERNAL_ERROR'
      ).toResponse();
    }

    // Handle unknown errors
    return new ApiError(
      'An unexpected error occurred',
      500,
      'INTERNAL_ERROR'
    ).toResponse();
  }
}

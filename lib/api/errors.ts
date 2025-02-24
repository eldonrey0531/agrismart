/**
 * API Error Detail
 */
export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  status: number;
  metadata?: Record<string, unknown>;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  code?: string;
  details?: ApiErrorDetail[];
  metadata?: Record<string, unknown>;
}

/**
 * Error Codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

/**
 * API Error class
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: ApiErrorDetail[];
  readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    status: number = 500,
    code?: ErrorCode,
    details?: ApiErrorDetail[],
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code ? ErrorCodes[code] : undefined;
    this.details = details;
    this.metadata = metadata;
  }

  /**
   * Convert to response format
   */
  toResponse(): ApiErrorResponse {
    return {
      error: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      metadata: this.metadata,
    };
  }

  /**
   * Create validation error
   */
  static validation(message: string, details: ApiErrorDetail[]): ApiError {
    return new ApiError(message, 400, 'VALIDATION_ERROR', details);
  }

  /**
   * Create not found error
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND');
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
}
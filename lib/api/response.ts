import { NextResponse } from 'next/server';
import { ApiError, type ApiSuccessResponse, type ApiErrorResponse, type ApiErrorDetail } from './errors';

/**
 * API Response Handler
 */
export class ApiResponse {
  /**
   * Create a success response
   */
  static success<T>(
    data: T,
    status: number = 200,
    metadata?: Record<string, unknown>
  ): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json(
      {
        data,
        status,
        metadata,
      },
      { status }
    );
  }

  /**
   * Create an error response
   */
  static error(
    error: string | ApiError | Error,
    status?: number,
    details?: ApiErrorDetail[],
    metadata?: Record<string, unknown>
  ): NextResponse<ApiErrorResponse> {
    // Handle ApiError instances
    if (error instanceof ApiError) {
      return NextResponse.json(
        error.toResponse(),
        { status: error.status }
      );
    }

    // Handle string messages
    if (typeof error === 'string') {
      return NextResponse.json(
        {
          error: error,
          status: status || 500,
          details,
          metadata,
        },
        { status: status || 500 }
      );
    }

    // Handle standard Error objects
    return NextResponse.json(
      {
        error: error.message || 'Internal Server Error',
        status: status || 500,
        details,
        metadata,
      },
      { status: status || 500 }
    );
  }

  /**
   * Create a validation error response
   */
  static validationError(
    message: string,
    details: ApiErrorDetail[]
  ): NextResponse<ApiErrorResponse> {
    const error = ApiError.validation(message, details);
    return this.error(error);
  }

  /**
   * Create a not found response
   */
  static notFound(
    message: string = 'Resource not found'
  ): NextResponse<ApiErrorResponse> {
    const error = ApiError.notFound(message);
    return this.error(error);
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized'
  ): NextResponse<ApiErrorResponse> {
    const error = ApiError.unauthorized(message);
    return this.error(error);
  }

  /**
   * Create a forbidden response
   */
  static forbidden(
    message: string = 'Forbidden'
  ): NextResponse<ApiErrorResponse> {
    const error = ApiError.forbidden(message);
    return this.error(error);
  }

  /**
   * Handle any error and convert to response
   */
  static catch(error: unknown): NextResponse<ApiErrorResponse> {
    if (error instanceof ApiError) {
      return this.error(error);
    }

    if (error instanceof Error) {
      return this.error(error.message || 'Internal Server Error', 500);
    }

    return this.error('An unexpected error occurred', 500);
  }
}
import { NextResponse } from 'next/server';
import type { 
  ApiSuccessResponse, 
  ApiErrorResponse, 
  ApiErrorDetail,
  ErrorCode,
  ErrorCodes
} from '@/types/api';

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
    message: string,
    status: number = 500,
    code: ErrorCode = 'INTERNAL_ERROR',
    details?: ApiErrorDetail[],
    metadata?: Record<string, unknown>
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        error: message,
        status,
        code: ErrorCodes[code],
        details,
        metadata,
      },
      { status }
    );
  }

  /**
   * Create a validation error response
   */
  static validationError(
    message: string,
    details: ApiErrorDetail[]
  ): NextResponse<ApiErrorResponse> {
    return this.error(
      message,
      400,
      'VALIDATION_ERROR',
      details
    );
  }

  /**
   * Create a not found response
   */
  static notFound(
    message: string = 'Resource not found'
  ): NextResponse<ApiErrorResponse> {
    return this.error(
      message,
      404,
      'NOT_FOUND'
    );
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized'
  ): NextResponse<ApiErrorResponse> {
    return this.error(
      message,
      401,
      'UNAUTHORIZED'
    );
  }

  /**
   * Create a forbidden response
   */
  static forbidden(
    message: string = 'Forbidden'
  ): NextResponse<ApiErrorResponse> {
    return this.error(
      message,
      403,
      'FORBIDDEN'
    );
  }

  /**
   * Convert any error to API response
   */
  static fromError(error: unknown): NextResponse<ApiErrorResponse> {
    if (error instanceof Error) {
      return this.error(error.message);
    }
    return this.error('An unexpected error occurred');
  }
}
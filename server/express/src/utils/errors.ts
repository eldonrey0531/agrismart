import { ApiResponse } from '../types';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

export const formatError = (error: any): ApiResponse<void> => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details })
      }
    };
  }

  // Default error response
  return {
    success: false,
    error: {
      message: error.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR'
    }
  };
};
import type { Request, Response } from 'express-serve-static-core';
import type { ValidationErrorDetail } from '../types/express';

export class AppError extends Error {
  public status: number;
  public code: string;
  public details?: ValidationErrorDetail[];

  constructor(message: string, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(
    message: string, 
    validationError?: { code?: string; details?: ValidationErrorDetail[] }
  ) {
    super(message, 400, validationError?.code || 'BAD_REQUEST');
    if (validationError?.details) {
      this.details = validationError.details;
    }
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: ValidationErrorDetail[]) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

// Error handler middleware
export const errorHandler = (
  err: any, 
  _req: Request, 
  res: Response, 
  _next: (err?: any) => void
) => {
  if (err instanceof AppError) {
    const response = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    };
    res.status(err.status).json(response);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details: ValidationErrorDetail[] = Object.values(err.errors).map((error: any) => ({
      field: error.path,
      message: error.message
    }));

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details
      }
    });
    return;
  }

  // Handle other errors
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};

export default {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  errorHandler
};

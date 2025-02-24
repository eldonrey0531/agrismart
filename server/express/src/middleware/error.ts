import { Request, Response, NextFunction } from 'express';
import { AuthServiceError } from '../services/auth.service';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  type: string;
  message: string;
  errors?: any[];
  data?: Record<string, any>;
}

/**
 * Custom error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle AuthServiceError
  if (err instanceof AuthServiceError) {
    res.status(err.status).json({
      success: false,
      type: err.type,
      message: err.message,
      ...(err.data && { data: err.data }),
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      type: 'VALIDATION_ERROR',
      message: 'Invalid input',
      errors: err.errors,
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json({
          success: false,
          type: 'DUPLICATE_ERROR',
          message: 'Resource already exists',
          data: { fields: err.meta?.target },
        });
        break;
      case 'P2025':
        res.status(404).json({
          success: false,
          type: 'NOT_FOUND',
          message: 'Resource not found',
        });
        break;
      default:
        res.status(500).json({
          success: false,
          type: 'DATABASE_ERROR',
          message: 'Database operation failed',
          ...(process.env.NODE_ENV === 'development' && {
            data: {
              code: err.code,
              meta: err.meta,
            },
          }),
        });
    }
    return;
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      type: 'VALIDATION_ERROR',
      message: 'Invalid database operation',
      ...(process.env.NODE_ENV === 'development' && {
        data: { message: err.message },
      }),
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      type: 'INVALID_TOKEN',
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      type: 'TOKEN_EXPIRED',
      message: 'Token expired',
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    type: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && {
      data: {
        name: err.name,
        message: err.message,
      },
    }),
  });
}

export default errorHandler;
import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { ValidationError } from '../validations/shared/validator';
import { ErrorCode } from '../types/shared';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export class AppError extends Error {
  public code: ErrorCode;
  public statusCode: number;
  public details?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    statusCode = 500,
    details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    ErrorCode.NOT_FOUND,
    404
  );
  next(error);
}

/**
 * Global error handler middleware that processes all application errors
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Default error values
  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'Internal Server Error';
  let details: Array<{ field: string; message: string }> | undefined;

  // Handle known error types
  if (error instanceof ValidationError) {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = error.message;
    details = error.details;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof TypeError) {
    statusCode = 400;
    errorCode = ErrorCode.BAD_REQUEST;
    message = 'Invalid request data';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ErrorCode.UNAUTHORIZED;
    message = 'Authentication required';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = ErrorCode.FORBIDDEN;
    message = 'Access denied';
  }

  // Log error with context
  logger.error(`${req.method} ${req.originalUrl}`, {
    error: {
      code: errorCode,
      message,
      details,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      originalError: process.env.NODE_ENV === 'development' ? error : undefined
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      params: req.params,
      body: process.env.NODE_ENV === 'development' ? req.body : undefined,
      userId: req.user?.id
    }
  });

  // Clean up error message for production
  if (process.env.NODE_ENV === 'production') {
    message = sanitizeErrorMessage(message);
    // Remove stack traces and internal details
    details = details?.map(detail => ({
      field: detail.field,
      message: sanitizeErrorMessage(detail.message)
    }));
  }

  // Send error response
  const errorResponse: ErrorResponse = {
    error: {
      code: errorCode,
      message,
      ...(details && { details })
    }
  };

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  res.status(statusCode).json(errorResponse);
}

/**
 * Sanitize error messages for production use
 */
function sanitizeErrorMessage(message: string): string {
  // Hide internal implementation details
  if (message.includes('ECONNREFUSED') || 
      message.includes('MongoError') ||
      message.includes('SequelizeError')) {
    return 'Service temporarily unavailable';
  }
  
  // Hide file paths
  if (message.includes('/') || message.includes('\\')) {
    return 'An unexpected error occurred';
  }
  
  // Hide database details
  if (message.includes('database') || 
      message.includes('mongo') || 
      message.includes('sql')) {
    return 'Data operation failed';
  }

  // Hide stack traces
  if (message.includes('at ') && message.includes('(')) {
    return 'An internal error occurred';
  }

  return message;
}

/**
 * Configure error handling for the Express application
 */
export function configureErrorHandling(app: any) {
  // Handle 404 errors
  app.use(notFoundHandler);
  
  // Global error handler
  app.use(errorHandler);

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection:', reason);
    // Let the process continue
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    // Perform graceful shutdown
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Performing graceful shutdown...');
    // Close server, DB connections, etc.
    process.exit(0);
  });
}

// Export error utility functions
export const createError = (
  message: string,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
  statusCode = 500,
  details?: Array<{ field: string; message: string }>
) => new AppError(message, code, statusCode, details);

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known error types
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.reduce((acc, curr) => {
      const path = curr.path.join('.');
      if (!acc[path]) acc[path] = [];
      acc[path].push(curr.message);
      return acc;
    }, {} as Record<string, string[]>);

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Log unknown errors
  logger.error('Unhandled error:', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params,
    },
  });

  // Return generic error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    timestamp: new Date().toISOString(),
  });
}
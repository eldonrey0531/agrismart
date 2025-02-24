import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { ApiError, handleError, ErrorResponse } from '../types/error';
import { config } from '../config';
import { ZodError } from 'zod';

interface Request extends ExpressRequest {
  method: string;
  path: string;
}

interface Response extends ExpressResponse {
  status(code: number): this;
  json(body: any): this;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle ZodError (validation errors)
  if (err instanceof ZodError) {
    const validationError = new ApiError(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    );
    res.status(400).json(validationError.toResponse());
    return;
  }

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toResponse());
    return;
  }

  // Convert unknown errors to ApiError
  const apiError = handleError(err);

  // Log error in development/testing
  if (config.ENV.NODE_ENV !== 'production') {
    console.error('Error:', {
      message: apiError.message,
      code: apiError.code,
      stack: apiError.stack,
      originalError: err
    });
  }

  // Send error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: apiError.message,
    code: apiError.code,
    statusCode: apiError.statusCode,
    ...(apiError.data && { data: apiError.data })
  };

  res.status(apiError.statusCode).json(errorResponse);
};

/**
 * Not found error handler
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new ApiError(
      `Path not found: ${req.method} ${req.path}`,
      'NOT_FOUND',
      404
    )
  );
};

/**
 * Handle async route errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Type guard for checking if error is an instance of ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};
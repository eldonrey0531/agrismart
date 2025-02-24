import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { MulterError } from 'multer';
import { AppError } from '../utils/app-error';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Handle Multer errors
  if (error instanceof MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds the maximum limit of 5MB',
          },
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Maximum number of files exceeded (5)',
          },
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: {
            code: 'INVALID_FIELD',
            message: 'Invalid field name for file upload',
          },
        });
      default:
        return res.status(400).json({
          error: {
            code: 'UPLOAD_ERROR',
            message: 'File upload error',
          },
        });
    }
  }

  // Handle known application errors
  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Handle validation errors (Mongoose)
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: Object.values(error).map((err: any) => ({
          field: err.path,
          message: err.message,
        })),
      },
    });
  }

  // Handle cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Invalid ID format',
      },
    });
  }

  // Log unknown errors
  console.error('Unhandled Error:', error);

  // Return generic error for unknown errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};

/**
 * Wrapper to catch async errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
};
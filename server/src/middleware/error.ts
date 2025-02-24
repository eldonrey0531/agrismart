import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import { AppError } from '../types';
import { log } from '../utils/logger';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  log.error('Error caught in global handler:', {
    error: error.message,
    stack: error.stack,
    path: req.path
  });

  // Handle known error types
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code || 'APP_ERROR',
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    handlePrismaError(error, res);
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors
      }
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired'
      }
    });
    return;
  }

  // Default error response
  const statusCode = (error as any).statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error'
    : error.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    }
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
}

function handlePrismaError(
  error: PrismaClientKnownRequestError,
  res: Response
): void {
  switch (error.code) {
    case 'P2002':
      res.status(409).json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT',
          message: 'A record with this value already exists'
        }
      });
      break;

    case 'P2025':
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found'
        }
      });
      break;

    case 'P2003':
      res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Referenced record does not exist'
        }
      });
      break;

    default:
      res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'An error occurred while accessing the database'
        }
      });
  }
}
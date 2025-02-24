import { Response } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { log } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details?: any;
  };
}

export const sendResponse = <T>(
  res: Response,
  { status = 200, data, message }: { status?: number; data?: T; message?: string }
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  
  res.status(status).json(response);
};

export const sendError = (
  res: Response,
  { status = 500, message = 'Internal Server Error', code = 'INTERNAL_ERROR', details }: {
    status?: number;
    message?: string;
    code?: string;
    details?: any;
  }
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      details
    }
  };

  log.error(message, { code, details });
  res.status(status).json(response);
};

export const handleError = (error: any, res: Response): void => {
  if (error instanceof ZodError) {
    sendError(res, {
      status: 400,
      message: 'Validation Error',
      code: 'VALIDATION_ERROR',
      details: error.errors
    });
  } else if (error instanceof PrismaClientKnownRequestError) {
    let message = 'Database Error';
    let code = 'DATABASE_ERROR';

    // Handle common Prisma error codes
    switch (error.code) {
      case 'P2002':
        message = 'Unique constraint violation';
        code = 'UNIQUE_VIOLATION';
        break;
      case 'P2025':
        message = 'Record not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        message = 'Foreign key constraint violation';
        code = 'FOREIGN_KEY_VIOLATION';
        break;
    }

    sendError(res, {
      status: error.code === 'P2025' ? 404 : 400,
      message,
      code,
      details: {
        target: error.meta,
        code: error.code
      }
    });
  } else {
    // Generic error handler
    sendError(res, {
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_ERROR',
      details: error.details
    });
  }
};

// Helper functions for common responses
export const responses = {
  ok: <T>(res: Response, data?: T, message?: string) =>
    sendResponse(res, { status: 200, data, message }),

  created: <T>(res: Response, data?: T, message = 'Resource created successfully') =>
    sendResponse(res, { status: 201, data, message }),

  noContent: (res: Response) =>
    res.status(204).end(),

  badRequest: (res: Response, message = 'Bad Request', details?: any) =>
    sendError(res, { status: 400, message, code: 'BAD_REQUEST', details }),

  unauthorized: (res: Response, message = 'Unauthorized') =>
    sendError(res, { status: 401, message, code: 'UNAUTHORIZED' }),

  forbidden: (res: Response, message = 'Forbidden') =>
    sendError(res, { status: 403, message, code: 'FORBIDDEN' }),

  notFound: (res: Response, message = 'Resource not found') =>
    sendError(res, { status: 404, message, code: 'NOT_FOUND' }),

  conflict: (res: Response, message = 'Resource already exists', details?: any) =>
    sendError(res, { status: 409, message, code: 'CONFLICT', details }),

  serverError: (res: Response, error?: Error) =>
    sendError(res, {
      status: 500,
      message: error?.message || 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      details: error
    })
};
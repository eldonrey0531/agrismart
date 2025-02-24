import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './user';

// Extend Express Request to include user
declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}

// Generic type for request handlers
export type RequestHandler<
  Params = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: Request<Params, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void> | void;

// Success response format
interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
}

// Error response format
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

// Helper to create success responses
export function createSuccessResponse<T>(data?: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Helper to create error responses
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
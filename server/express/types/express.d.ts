import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { AuthUser } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      token?: string;
      sessionId?: string;
      session?: Record<string, any>;
      deviceInfo?: {
        userAgent?: string;
        ip?: string;
        fingerprint?: string;
      };
    }
  }
}

// Success response format
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Error response format
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  code?: string;
}

// Combined API response type
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Custom request interface with generics
export interface CustomRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
> extends ExpressRequest<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
  token?: string;
  sessionId?: string;
  session?: Record<string, any>;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    fingerprint?: string;
  };
}

// Custom response interface
export interface CustomResponse<ResBody = any> extends ExpressResponse<ResBody> {
  json(body: ApiResponse<ResBody>): this;
}

// Request handler type
export type RequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
> = (
  req: CustomRequest<P, ApiResponse<ResBody>, ReqBody, ReqQuery>,
  res: CustomResponse<ResBody>,
  next: NextFunction
) => void | Promise<void>;

// Middleware type
export type Middleware<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
> = RequestHandler<P, ResBody, ReqBody, ReqQuery>;

// Route configuration
export interface RouteDefinition<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
> {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: RequestHandler<P, ResBody, ReqBody, ReqQuery>;
  middleware?: Middleware[];
  validation?: {
    body?: any;
    query?: any;
    params?: any;
  };
}

// Helper function to create error response
export const createErrorResponse = (
  message: string,
  code?: string,
  errors?: Record<string, string[]>
): ApiErrorResponse => ({
  success: false,
  message,
  code,
  errors,
  timestamp: new Date().toISOString(),
});

// Helper function to create success response
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

// Helper to wrap async handlers
export const createHandler = <P = ParamsDictionary, ResBody = any, ReqBody = any>(
  handler: RequestHandler<P, ResBody, ReqBody>
): RequestHandler<P, ResBody, ReqBody> => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

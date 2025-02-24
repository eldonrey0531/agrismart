import { z } from 'zod';
import { Request, Response } from 'express';

/**
 * Common API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  pagination?: {
    hasMore: boolean;
    nextCursor?: string;
    prevCursor?: string;
    total?: number;
  };
}

/**
 * Base parameter interface
 */
export interface BaseParams {
  [key: string]: string;
}

/**
 * Extended request type
 */
export type TypedRequest<P = BaseParams, B = any> = Request<P, any, B>;
export type TypedResponse = Response;

/**
 * Validation schema interface
 */
export interface ValidationSchema<T = any> {
  body?: z.ZodSchema<T>;
  query?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
}

/**
 * Error types
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400, errors);
    this.name = 'ValidationError';
  }
}

/**
 * Configuration interfaces
 */
export interface ServerConfig {
  port: number;
  env: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Request validation result
 */
export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
}

/**
 * HTTP methods type
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Route handler type
 */
export type RouteHandler<P = BaseParams, B = any> = (
  req: TypedRequest<P, B>,
  res: TypedResponse
) => Promise<void>;

/**
 * Route definition interface
 */
export interface RouteDefinition<P = BaseParams, B = any> {
  method: HttpMethod;
  path: string;
  handler: RouteHandler<P, B>;
  schema?: ValidationSchema<B>;
  middleware?: any[];
}
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Base interface for route parameters
 */
export interface RouteParams {
  [key: string]: string | undefined;
}

/**
 * Type for request handlers with typed parameters
 */
export type TypedRequestHandler<P extends RouteParams = RouteParams, B = any, Q = any> = (
  req: Request<P, any, B, Q>,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Type for controllers with typed request handlers
 */
export type Controller<P extends RouteParams = RouteParams, B = any, Q = any> = {
  [key: string]: TypedRequestHandler<P, B, Q>;
};

/**
 * Type for error handler middleware
 */
export type ErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Interface for validation schemas
 */
export interface ValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Interface for route definitions
 */
export interface RouteDefinition<P extends RouteParams = RouteParams> {
  path: string;
  method: string;
  handler: TypedRequestHandler<P>;
  schema?: ValidationSchema;
  middleware?: any[];
}

/**
 * Type for router configuration
 */
export interface RouterConfig {
  prefix?: string;
  middleware?: any[];
}

/**
 * Type for controller configuration
 */
export interface ControllerConfig {
  prefix?: string;
  middleware?: any[];
  validators?: ValidationSchema;
}

/**
 * Type for a collection of route definitions
 */
export interface Routes<P extends RouteParams = RouteParams> {
  [key: string]: RouteDefinition<P>;
}

/**
 * HTTP Methods
 */
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

/**
 * Request validation result
 */
export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Base response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
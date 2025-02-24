import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import * as ExpressTypes from "./express";

// User and Authentication types
export type UserRole = "user" | "admin" | "moderator";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  type: "access" | "refresh" | "verification" | "passwordReset";
}

// Basic type exports
export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Middleware types
export type MiddlewareFunction = RequestHandler | ErrorRequestHandler;

export interface MiddlewareConfig {
  enabled?: boolean;
  order?: number;
  options?: Record<string, any>;
}

export interface MiddlewareDefinition {
  handler: MiddlewareFunction;
  config?: MiddlewareConfig;
}

// Controller types
export type ControllerHandler = RequestHandler;

export interface ControllerDefinition {
  [key: string]: {
    handler: ControllerHandler;
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    middleware?: MiddlewareFunction[];
  };
}

// Route types
export interface RouteDefinition {
  method: "get" | "post" | "put" | "patch" | "delete";
  path: string;
  handler: RequestHandler | RequestHandler[];
  middleware?: MiddlewareFunction[];
}

export interface RouterDefinition {
  prefix?: string;
  routes: RouteDefinition[];
  middleware?: MiddlewareFunction[];
}

// Service types
export interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: Error | null;
}

export interface ServiceOptions {
  session?: any;
  transaction?: any;
  user?: Express.Request["user"];
  [key: string]: any;
}

// Validation types
export interface ValidationRule {
  validator: (value: any) => boolean | Promise<boolean>;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

// Authentication types
export interface AuthOptions {
  session?: boolean;
  passReqToCallback?: boolean;
}

// Cache types
export interface CacheConfig {
  ttl: number;
  namespace?: string;
}

// Queue types
export interface QueueConfig {
  concurrency?: number;
  timeout?: number;
  attempts?: number;
}

export interface QueueJob {
  id: string;
  type: string;
  data: any;
  options?: QueueConfig;
}

// WebSocket types
export interface WebSocketConfig {
  path: string;
  auth?: boolean;
}

// Environment types
export type Environment = "development" | "production" | "test";

// Logger types
export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

// Database types
export type { ObjectId } from "mongoose";

// Re-export Express specific types with namespace
export const Express = {
  ...ExpressTypes,
};

// Constants
export const Constants = {
  Environment: ["development", "production", "test"] as Environment[],
  RequestMethods: ["get", "post", "put", "patch", "delete"] as const,
};

// Default export
export default {
  Constants,
  Express,
};

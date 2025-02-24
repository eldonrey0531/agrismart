import { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import { MongooseError } from "mongoose";
import { AppError, isAppError, ValidationError } from "../utils/app-error";
import { logger } from "../utils/logger";

interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  stack?: string;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Error handling request:", {
    error: err,
    path: req.path,
    method: req.method,
  });

  // Default error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: "Internal server error",
    error: "ServerError",
    timestamp: new Date().toISOString(),
  };

  // Handle specific error types
  if (isAppError(err)) {
    // Handle our custom AppError types
    errorResponse.message = err.message;
    errorResponse.error = err.constructor.name;
    res.status(err.statusCode);

    if (err instanceof ValidationError) {
      errorResponse.errors = err.errors;
    }
  } else if (err instanceof ZodError) {
    // Handle Zod validation errors
    errorResponse.message = "Validation failed";
    errorResponse.error = "ValidationError";
    errorResponse.errors = err.errors.reduce((acc, curr) => {
      const path = curr.path.join(".");
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(curr.message);
      return acc;
    }, {} as Record<string, string[]>);
    res.status(400);
  } else if (err instanceof MongooseError) {
    // Handle Mongoose errors
    errorResponse.message = "Database operation failed";
    errorResponse.error = err.name;
    if (err.name === "ValidationError") {
      const mongooseErr = err as any;
      errorResponse.errors = Object.keys(mongooseErr.errors).reduce((acc, key) => {
        acc[key] = [mongooseErr.errors[key].message];
        return acc;
      }, {} as Record<string, string[]>);
      res.status(400);
    } else if (err.name === "CastError") {
      errorResponse.message = "Invalid data format";
      res.status(400);
    } else {
      res.status(500);
    }
  } else if (err instanceof JsonWebTokenError) {
    // Handle JWT errors
    errorResponse.message = "Invalid token";
    errorResponse.error = "AuthenticationError";
    if (err instanceof TokenExpiredError) {
      errorResponse.message = "Token expired";
    }
    res.status(401);
  } else {
    // Handle unknown errors
    if (process.env.NODE_ENV === "development") {
      errorResponse.message = err.message;
      errorResponse.error = err.name;
      errorResponse.stack = err.stack;
    }
    res.status(500);
  }

  // Add request ID if available
  if (req.id) {
    errorResponse.message = `[${req.id}] ${errorResponse.message}`;
  }

  // Send error response
  res.json(errorResponse);
};

/**
 * Handle 404 errors for routes that don't exist
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const err = new AppError(`Cannot ${req.method} ${req.url}`, 404);
  next(err);
};

/**
 * Handle uncaught errors
 */
export const uncaughtErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error("Uncaught error:", err);

  const errorResponse: ErrorResponse = {
    success: false,
    message: "Internal server error",
    error: "ServerError",
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
};

export default {
  errorHandler,
  notFoundHandler,
  uncaughtErrorHandler,
};

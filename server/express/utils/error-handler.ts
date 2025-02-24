import { Request, Response, NextFunction } from "express";
import { MongoError } from "mongodb";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { AppError, isAppError, ValidationError } from "./app-error";
import { logger } from "./logger";

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });

  // Handle known errors
  if (isAppError(err)) {
    return handleAppError(err, res);
  }

  if (err instanceof ZodError) {
    return handleZodError(err, res);
  }

  if (err instanceof MongooseError.ValidationError) {
    return handleMongooseValidationError(err, res);
  }

  if (err instanceof MongoError) {
    return handleMongoError(err, res);
  }

  // Handle unknown errors
  return handleUnknownError(err, res);
};

/**
 * Handle AppError instances
 */
const handleAppError = (err: AppError, res: Response) => {
  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    ...(err instanceof ValidationError && { errors: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Handle Zod validation errors
 */
const handleZodError = (err: ZodError, res: Response) => {
  const errors = err.errors.reduce((acc, error) => {
    const path = error.path.join(".");
    if (!acc[path]) {
      acc[path] = [];
    }
    acc[path].push(error.message);
    return acc;
  }, {} as Record<string, string[]>);

  return res.status(400).json({
    success: false,
    status: "fail",
    message: "Validation error",
    errors,
  });
};

/**
 * Handle Mongoose validation errors
 */
const handleMongooseValidationError = (
  err: MongooseError.ValidationError,
  res: Response
) => {
  const errors = Object.keys(err.errors).reduce((acc, key) => {
    acc[key] = [err.errors[key].message];
    return acc;
  }, {} as Record<string, string[]>);

  return res.status(400).json({
    success: false,
    status: "fail",
    message: "Validation error",
    errors,
  });
};

/**
 * Handle MongoDB errors
 */
const handleMongoError = (err: MongoError, res: Response) => {
  if (err.code === 11000) {
    // Duplicate key error
    const field = Object.keys(err as any)[0];
    return res.status(409).json({
      success: false,
      status: "fail",
      message: `Duplicate value for field: ${field}`,
    });
  }

  return res.status(500).json({
    success: false,
    status: "error",
    message: "Database operation failed",
  });
};

/**
 * Handle unknown errors
 */
const handleUnknownError = (err: Error, res: Response) => {
  const statusCode = 500;
  return res.status(statusCode).json({
    success: false,
    status: "error",
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

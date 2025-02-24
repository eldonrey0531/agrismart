import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Wraps an async route handler to properly catch and forward errors to error handling middleware
 * @param fn Async route handler function
 * @returns Route handler with error handling
 */
export const asyncHandler = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch((error) => {
      // Convert unknown errors to AppError
      if (!(error instanceof AppError)) {
        error = new AppError(
          error.message || 'Internal Server Error',
          error.status || 500
        );
      }
      next(error);
    });
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle AppError instances
  if (error instanceof AppError) {
    const response: any = {
      success: false,
      error: error.message,
    };

    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack;
    }

    res.status(error.status).json(response);
    return;
  }

  // Handle unknown errors
  console.error('Unhandled Error:', error);
  const response: any = {
    success: false,
    error: 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    if (error.message) response.message = error.message;
    if (error.stack) response.stack = error.stack;
  }

  res.status(500).json(response);
};

/**
 * Creates a rate limiter middleware
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum number of requests allowed in the window
 */
export const createRateLimiter = (windowMs: number, maxRequests: number): RequestHandler => {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const requestTimes = requests.get(ip) || [];

    // Remove requests outside the time window
    const validRequests = requestTimes.filter(time => time > now - windowMs);
    
    if (validRequests.length >= maxRequests) {
      const resetTime = requestTimes[0] + windowMs;
      res.set({
        'X-RateLimit-Reset': resetTime.toString(),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0'
      });
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
      });
      return;
    }

    // Add current request
    validRequests.push(now);
    requests.set(ip, validRequests);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - validRequests.length).toString()
    });

    next();
  };
};

export default {
  asyncHandler,
  errorHandler,
  createRateLimiter,
};
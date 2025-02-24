import { Request, Response, NextFunction } from 'express';
import { auth, requireRole, requireAdmin, requireSeller, requireOwnership } from './auth';
import { asyncHandler, errorHandler, createRateLimiter } from './asyncHandler';
import { validateInput } from '../utils/validation';

// Middleware that requires request validation
export const validate = (schema: any) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await validateInput(schema, {
        ...req.body,
        ...req.query,
        ...req.params,
      });
      req.validatedData = data;
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
        return;
      }
      next(error);
    }
  });
};

// Common rate limits
export const standardRateLimit = createRateLimiter(60 * 1000, 60); // 60 requests per minute
export const authRateLimit = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimiter(60 * 1000, 100); // 100 requests per minute

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} [${res.statusCode}] ${duration}ms`
    );
  });
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}

export {
  auth,
  requireRole,
  requireAdmin,
  requireSeller,
  requireOwnership,
  asyncHandler,
  errorHandler,
  createRateLimiter,
};

export default {
  auth,
  requireRole,
  requireAdmin,
  requireSeller,
  requireOwnership,
  asyncHandler,
  errorHandler,
  createRateLimiter,
  validate,
  standardRateLimit,
  authRateLimit,
  apiRateLimit,
  requestLogger,
};

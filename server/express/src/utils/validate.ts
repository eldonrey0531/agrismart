import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from './errors';
import { asyncHandler } from '../types/express';

/**
 * Validate request body against Zod schema
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Invalid request body', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }));
      } else {
        next(error);
      }
    }
  });
}

/**
 * Validate request query against Zod schema
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Invalid query parameters', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }));
      } else {
        next(error);
      }
    }
  });
}

/**
 * Validate request params against Zod schema
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.params);
      req.params = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Invalid path parameters', {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }));
      } else {
        next(error);
      }
    }
  });
}

/**
 * Common validation schemas
 */
export const schemas = {
  id: z.object({
    id: z.string().min(1),
  }),

  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  search: z.object({
    q: z.string().min(1).max(100),
  }),
};
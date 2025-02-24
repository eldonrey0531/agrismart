import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';
import { AsyncRequestHandler } from '../types/express';

type ValidationSchema = z.ZodType<any, any>;

export interface RequestValidation {
  body?: ValidationSchema;
  query?: ValidationSchema;
  params?: ValidationSchema;
}

/**
 * Middleware to validate request data against Zod schemas
 */
export const validateRequest = (schemas: RequestValidation): AsyncRequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body if schema provided
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query parameters if schema provided
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validate route parameters if schema provided
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(new ValidationError('Validation failed', {
          errors: validationErrors,
        }));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Helper to validate only request body
 */
export const validateBody = <T>(schema: z.Schema<T>): AsyncRequestHandler => {
  return validateRequest({ body: schema });
};

/**
 * Helper to validate only query parameters
 */
export const validateQuery = <T>(schema: z.Schema<T>): AsyncRequestHandler => {
  return validateRequest({ query: schema });
};

/**
 * Helper to validate only route parameters
 */
export const validateParams = <T>(schema: z.Schema<T>): AsyncRequestHandler => {
  return validateRequest({ params: schema });
};

/**
 * Type helper for creating validation schemas
 */
export type ValidatedRequest<T extends RequestValidation> = Request & {
  body: T['body'] extends z.Schema<infer U> ? U : unknown;
  query: T['query'] extends z.Schema<infer U> ? U : unknown;
  params: T['params'] extends z.Schema<infer U> ? U : unknown;
};
// Schema exports
export * from './common.schema';
export * from './auth.schema';
export * from './marketplace.schema';
export * from './chat.schema';
export * from './admin.schema';
export * from './notification.schema';

// Middleware exports
export * from '../middleware/validation.handler';
export * from '../middleware/error.handler';

// Validation utilities
import { ZodSchema } from 'zod';
import { Request } from 'express';
import { Response, NextFunction } from 'express-serve-static-core';
import { validateRequest, validateRequestSchema } from '../middleware/validation.handler';

// Type for validated request
type ValidatedRequest<T> = Request & {
  body: T;
  query: T;
  params: T;
};

/**
 * Create route validation middleware
 */
export function createValidator<T extends ZodSchema>(
  schema: T,
  location: 'body' | 'query' | 'params' = 'body'
) {
  return validateRequest(schema, location);
}

/**
 * Create multi-schema validator
 */
export function createSchemaValidator(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return validateRequestSchema(schemas);
}

/**
 * Type-safe request handler with validation
 */
export function withValidation<T extends ZodSchema>(
  schema: T,
  location: 'body' | 'query' | 'params' = 'body',
  handler: (
    req: Request & { [K in typeof location]: T['_output'] },
    res: Response,
    next: NextFunction
  ) => Promise<void>
) {
  return [
    validateRequest(schema, location),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req as any, res, next);
      } catch (error) {
        next(error);
      }
    }
  ];
}

/**
 * Type-safe route handler with multiple schema validation
 */
export function withSchemaValidation<
  B extends ZodSchema = never,
  Q extends ZodSchema = never,
  P extends ZodSchema = never
>(
  schemas: {
    body?: B;
    query?: Q;
    params?: P;
  },
  handler: (
    req: Request & {
      body: B extends ZodSchema ? B['_output'] : any;
      query: Q extends ZodSchema ? Q['_output'] : any;
      params: P extends ZodSchema ? P['_output'] : any;
    },
    res: Response,
    next: NextFunction
  ) => Promise<void>
) {
  return [
    validateRequestSchema(schemas),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req as any, res, next);
      } catch (error) {
        next(error);
      }
    }
  ];
}

// Helper type for route handlers with validation
export type ValidatedHandler<T> = (
  req: ValidatedRequest<T>,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Helper type for schema validation options
export type ValidationLocation = 'body' | 'query' | 'params';
export type ValidationOptions = {
  strict?: boolean;
  parseParams?: any;
};
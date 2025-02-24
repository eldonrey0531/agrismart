import { Request as ExpressRequest, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { ZodError, ZodSchema, ParseParams } from 'zod';
import { ApiError } from '../types/error';

interface Request extends ExpressRequest {
  body: any;
  query: any;
  params: any;
}

interface ValidationOptions {
  /**
   * Remove unknown keys from validated objects
   */
  strict?: boolean;
  /**
   * Additional Zod parse parameters
   */
  parseParams?: Partial<ParseParams>;
}

type RequestLocation = 'body' | 'query' | 'params';

/**
 * Convert validation options to Zod parse params
 */
const getParseParams = (options: ValidationOptions): Partial<ParseParams> => ({
  ...(options.parseParams || {}),
  ...(options.strict && { strict: true })
});

/**
 * Validate request data against a Zod schema
 */
export const validateRequest = (
  schema: ZodSchema,
  location: RequestLocation = 'body',
  options: ValidationOptions = {}
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const target = req[location];
      const parseParams = getParseParams(options);
      const parsed = await schema.parseAsync(target, parseParams);

      // Update request with parsed data
      req[location] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ApiError(
            'Validation failed',
            'VALIDATION_ERROR',
            400,
            error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          )
        );
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate multiple request locations
 */
export const validateRequestSchema = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}, options: ValidationOptions = {}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseParams = getParseParams(options);
      const validations: Promise<void>[] = [];

      if (schemas.body) {
        validations.push(
          schemas.body.parseAsync(req.body, parseParams)
            .then(data => { req.body = data; })
        );
      }

      if (schemas.query) {
        validations.push(
          schemas.query.parseAsync(req.query, parseParams)
            .then(data => { req.query = data; })
        );
      }

      if (schemas.params) {
        validations.push(
          schemas.params.parseAsync(req.params, parseParams)
            .then(data => { req.params = data; })
        );
      }

      await Promise.all(validations);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ApiError(
            'Validation failed',
            'VALIDATION_ERROR',
            400,
            error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          )
        );
      } else {
        next(error);
      }
    }
  };
};

/**
 * Helper to create a validation middleware for a specific schema
 */
export const createValidator = <T extends ZodSchema>(
  schema: T,
  location: RequestLocation = 'body',
  options: ValidationOptions = {}
) => validateRequest(schema, location, options);
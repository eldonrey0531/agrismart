import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../types/common';

interface ValidateOptions {
  location: 'body' | 'query' | 'params';
}

/**
 * Middleware factory that creates a validator for the specified request location
 */
export const validate = (schema: ZodSchema, options: ValidateOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const target = req[options.location];
      const result = await schema.parseAsync(target);
      
      // Replace the request data with the validated result
      req[options.location] = result;
      next();
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        const validationError = new ValidationError(
          'Validation failed',
          {
            [options.location]: [error.message],
          }
        );
        next(validationError);
      } else {
        // Handle unknown errors
        next(new Error('Invalid request data'));
      }
    }
  };
};

/**
 * Helper function to combine multiple validators
 */
export const combineValidators = (...validators: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(
        validators.map(validator => new Promise((resolve, reject) => {
          validator(req, res, (err: Error) => {
            if (err) reject(err);
            else resolve(true);
          });
        }))
      );
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper function to create a schema validator with custom error messages
 */
export const createValidator = (
  schema: ZodSchema,
  options: ValidateOptions,
  errorMessages?: Record<string, string>
) => {
  const schemaWithMessages = schema.transform((data) => {
    if (errorMessages && !schema.safeParse(data).success) {
      const path = Object.keys(errorMessages)[0];
      throw new Error(errorMessages[path]);
    }
    return data;
  });

  return validate(schemaWithMessages, options);
};
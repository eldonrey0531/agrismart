import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../types/http';
import { log } from '../utils/logger';
import { throwError } from '../lib/errors';

export interface RequestValidation<T extends z.Schema> {
  params?: T;
  query?: T;
  body?: T;
}

export interface ValidateOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

export function validate<T extends z.Schema>(
  schema: RequestValidation<T>,
  options: ValidateOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationPromises: Promise<any>[] = [];
      const validationErrors: ValidationError[] = [];

      // Validate params
      if (schema.params) {
        validationPromises.push(
          schema.params.parseAsync(req.params).catch(error => {
            if (error instanceof z.ZodError) {
              validationErrors.push(...formatZodErrors(error, 'params'));
            }
          })
        );
      }

      // Validate query
      if (schema.query) {
        validationPromises.push(
          schema.query.parseAsync(req.query).catch(error => {
            if (error instanceof z.ZodError) {
              validationErrors.push(...formatZodErrors(error, 'query'));
            }
          })
        );
      }

      // Validate body
      if (schema.body) {
        validationPromises.push(
          schema.body.parseAsync(req.body).catch(error => {
            if (error instanceof z.ZodError) {
              validationErrors.push(...formatZodErrors(error, 'body'));
            }
          })
        );
      }

      await Promise.all(validationPromises);

      if (validationErrors.length > 0) {
        throwError.validation('Validation failed', validationErrors);
      }

      next();
    } catch (error) {
      log.error('Validation error:', error);
      next(error);
    }
  };
}

function formatZodErrors(error: z.ZodError, location: string): ValidationError[] {
  return error.errors.map(err => ({
    field: `${location}.${err.path.join('.')}`,
    message: getErrorMessage(err),
    code: getErrorCode(err)
  }));
}

function getErrorMessage(error: z.ZodIssue): string {
  switch (error.code) {
    case z.ZodIssueCode.invalid_type:
      return `Expected ${error.expected}, received ${error.received}`;
    case z.ZodIssueCode.invalid_enum_value:
      return `Invalid value. Expected one of: ${error.options?.join(', ')}`;
    case z.ZodIssueCode.invalid_string:
      if (error.validation === 'email') {
        return 'Invalid email address';
      }
      if (error.validation === 'url') {
        return 'Invalid URL format';
      }
      return error.message;
    case z.ZodIssueCode.too_small:
      const min = error.minimum;
      if (error.type === 'string') {
        return `Must be at least ${min} characters`;
      }
      if (error.type === 'number') {
        return `Must be greater than ${min}`;
      }
      return error.message;
    case z.ZodIssueCode.too_big:
      const max = error.maximum;
      if (error.type === 'string') {
        return `Must not exceed ${max} characters`;
      }
      if (error.type === 'number') {
        return `Must not exceed ${max}`;
      }
      return error.message;
    default:
      return error.message;
  }
}

function getErrorCode(error: z.ZodIssue): string {
  switch (error.code) {
    case z.ZodIssueCode.invalid_type:
      return 'INVALID_TYPE';
    case z.ZodIssueCode.invalid_literal:
      return 'INVALID_LITERAL';
    case z.ZodIssueCode.invalid_enum_value:
      return 'INVALID_ENUM';
    case z.ZodIssueCode.invalid_string:
      return `INVALID_STRING_${(error.validation || 'FORMAT').toUpperCase()}`;
    case z.ZodIssueCode.too_small:
      return `TOO_${error.type === 'string' ? 'SHORT' : 'SMALL'}`;
    case z.ZodIssueCode.too_big:
      return `TOO_${error.type === 'string' ? 'LONG' : 'LARGE'}`;
    case z.ZodIssueCode.custom:
      return 'CUSTOM_ERROR';
    default:
      return 'VALIDATION_ERROR';
  }
}

// Export validation helpers
export const validateSchema = {
  body: <T extends z.Schema>(schema: T) => validate({ body: schema }),
  query: <T extends z.Schema>(schema: T) => validate({ query: schema }),
  params: <T extends z.Schema>(schema: T) => validate({ params: schema }),
  all: <T extends z.Schema>(schema: RequestValidation<T>) => validate(schema)
};
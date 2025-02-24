import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import { AnyZodObject, ZodSchema, ZodError } from 'zod';
import { ApiError } from '../types/error';

interface TypedRequest<T = any> extends Request {
  body: T;
  query: any;
  params: any;
}

export const validateBody = (schema: ZodSchema) => {
  return async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const validData = await schema.parseAsync(req.body);
      req.body = validData; // Replace with validated data
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          ApiError.badRequest('Validation error', {
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          })
        );
      }
      return next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const validData = await schema.parseAsync(req.query);
      req.query = validData; // Replace with validated data
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          ApiError.badRequest('Invalid query parameters', {
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          })
        );
      }
      return next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: TypedRequest, res: Response, next: NextFunction) => {
    try {
      const validData = await schema.parseAsync(req.params);
      req.params = validData; // Replace with validated data
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          ApiError.badRequest('Invalid path parameters', {
            errors: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          })
        );
      }
      return next(error);
    }
  };
};
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export class ValidationError extends Error {
  constructor(public errors: ZodError['errors']) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export const validate = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(error.errors));
      } else {
        next(error);
      }
    }
  };
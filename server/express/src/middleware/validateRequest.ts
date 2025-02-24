import { Request, Response, NextFunction } from 'express';
import { ValidationChain, ValidationError as ExpressValidationError, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export function validateRequest(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const validationErrors = errors.array().map(err => ({
          field: err.type === 'field' ? err.path : 'unknown',
          message: err.msg,
          value: err.type === 'field' ? err.value : undefined
        }));
        throw new ValidationError('Invalid request data', validationErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Alias for validateRequest to maintain backward compatibility
export const validateBody = validateRequest;
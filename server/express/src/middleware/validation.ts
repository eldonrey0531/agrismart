import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { ApiResponse } from '../types';

interface ValidationErrorDetail {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  message: string;
  code: string;
  details: ValidationErrorDetail[];
}

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((err: ValidationError) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationErrors
      }
    } as ApiResponse<ValidationErrorResponse>);
  }
  
  next();
};

export const validateRequestWithFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      const errors: ValidationErrorDetail[] = missingFields.map(field => ({
        field,
        message: `${field} is required`
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS',
          details: errors
        }
      } as ApiResponse<ValidationErrorResponse>);
    }
    
    next();
  };
};
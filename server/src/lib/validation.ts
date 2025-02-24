import { z } from 'zod';
import { Request } from 'express';
import { ValidationError } from '../types/http';
import { log } from '../utils/logger';

export interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
  data?: any;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

export class ValidationService {
  static async validate<T>(
    schema: z.Schema<T>,
    data: unknown,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    try {
      const validatedData = await schema.parseAsync(data, {
        errorMap: (error) => ({
          message: this.getErrorMessage(error)
        })
      });

      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = this.formatZodError(error);
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Log unexpected errors
      log.error('Validation error:', error);
      throw error;
    }
  }

  static validateRequest<T extends z.Schema>(
    schema: T,
    location: keyof Request | 'all' = 'all'
  ): ValidationResult {
    return {
      success: true,
      data: {} as z.infer<T>
    };
  }

  private static formatZodError(error: z.ZodError): ValidationError[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: this.getErrorCode(err)
    }));
  }

  private static getErrorMessage(error: z.ZodIssueBase): string {
    switch (error.code) {
      case 'invalid_type':
        return `Expected ${error.expected}, received ${error.received}`;
      case 'invalid_enum_value':
        return `Invalid value. Expected one of: ${(error as any).options.join(', ')}`;
      case 'invalid_string':
        if ((error as any).validation === 'email') {
          return 'Invalid email address';
        }
        if ((error as any).validation === 'url') {
          return 'Invalid URL format';
        }
        return error.message || 'Invalid string';
      case 'too_small':
        if (error.type === 'string') {
          return `Must be at least ${(error as any).minimum} characters`;
        }
        if (error.type === 'number') {
          return `Must be greater than ${(error as any).minimum}`;
        }
        return error.message || 'Value is too small';
      case 'too_big':
        if (error.type === 'string') {
          return `Must not exceed ${(error as any).maximum} characters`;
        }
        if (error.type === 'number') {
          return `Must not exceed ${(error as any).maximum}`;
        }
        return error.message || 'Value is too large';
      default:
        return error.message || 'Validation failed';
    }
  }

  private static getErrorCode(error: z.ZodIssue): string {
    switch (error.code) {
      case 'invalid_type':
        return 'INVALID_TYPE';
      case 'invalid_literal':
        return 'INVALID_LITERAL';
      case 'invalid_enum_value':
        return 'INVALID_ENUM';
      case 'invalid_string':
        return `INVALID_STRING_${(error as any).validation?.toUpperCase() || 'FORMAT'}`;
      case 'too_small':
        return `TOO_${error.type === 'string' ? 'SHORT' : 'SMALL'}`;
      case 'too_big':
        return `TOO_${error.type === 'string' ? 'LONG' : 'LARGE'}`;
      case 'custom':
        return 'CUSTOM_ERROR';
      default:
        return 'VALIDATION_ERROR';
    }
  }

  static validateSync<T>(schema: z.Schema<T>, data: unknown): ValidationResult {
    try {
      const validatedData = schema.parse(data);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = this.formatZodError(error);
        return {
          success: false,
          errors: validationErrors
        };
      }
      throw error;
    }
  }

  static validatePartial<T>(schema: z.Schema<T>, data: unknown): ValidationResult {
    const partialSchema = schema.partial();
    return this.validateSync(partialSchema, data);
  }

  static coerce<T>(schema: z.Schema<T>, value: unknown): T | undefined {
    try {
      return schema.parse(value);
    } catch {
      return undefined;
    }
  }
}
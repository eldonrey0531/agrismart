import { z } from 'zod';
import { ErrorCode, ErrorResponse } from '../../types/shared';

export class ValidationError extends Error {
  public code: ErrorCode;
  public details?: { field: string; message: string }[];

  constructor(message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ValidationError';
    this.code = ErrorCode.VALIDATION_ERROR;
    this.details = details;
  }
}

export interface ValidatorOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

export class Validator {
  /**
   * Validate data against a schema and return typed result
   */
  static async validate<T extends z.ZodType>(
    schema: T,
    data: unknown,
    options: ValidatorOptions = {}
  ): Promise<z.infer<T>> {
    try {
      const result = await schema.parseAsync(data);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Validation failed',
          this.formatValidationErrors(error)
        );
      }
      throw error;
    }
  }

  /**
   * Format Zod validation errors into a consistent structure
   */
  private static formatValidationErrors(error: z.ZodError): ErrorResponse['error']['details'] {
    return error.issues.map(issue => {
      const path = issue.path.join('.');
      let message = '';

      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          message = `Expected ${issue.expected}, received ${issue.received}`;
          break;

        case z.ZodIssueCode.invalid_enum_value:
          message = `Invalid value. Expected one of: ${(issue as z.ZodInvalidEnumValueIssue).options.join(', ')}`;
          break;

        case z.ZodIssueCode.too_small:
          const smallIssue = issue as z.ZodTooSmallIssue;
          message = `Value is too small. Minimum ${smallIssue.inclusive ? '(inclusive)' : '(exclusive)'}: ${smallIssue.minimum}`;
          break;

        case z.ZodIssueCode.too_big:
          const bigIssue = issue as z.ZodTooBigIssue;
          message = `Value is too large. Maximum ${bigIssue.inclusive ? '(inclusive)' : '(exclusive)'}: ${bigIssue.maximum}`;
          break;

        case z.ZodIssueCode.custom:
          message = issue.message || 'Invalid value';
          break;

        default:
          message = issue.message;
      }

      return {
        field: path || '_',
        message
      };
    });
  }

  /**
   * Validate request body against a schema
   */
  static async validateBody<T extends z.ZodType>(
    schema: T,
    body: unknown
  ): Promise<z.infer<T>> {
    return this.validate(schema, body);
  }

  /**
   * Validate request query parameters against a schema
   */
  static async validateQuery<T extends z.ZodType>(
    schema: T,
    query: unknown
  ): Promise<z.infer<T>> {
    return this.validate(schema, query);
  }

  /**
   * Validate request parameters against a schema
   */
  static async validateParams<T extends z.ZodType>(
    schema: T,
    params: unknown
  ): Promise<z.infer<T>> {
    return this.validate(schema, params);
  }

  /**
   * Validate file uploads against schema
   */
  static async validateFiles<T extends z.ZodType>(
    schema: T,
    files: unknown
  ): Promise<z.infer<T>> {
    return this.validate(schema, files);
  }

  /**
   * Format error response
   */
  static formatError(error: ValidationError): ErrorResponse {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }
}

export default Validator;
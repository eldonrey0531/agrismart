import { z } from 'zod';
import { userValidation } from './user.schemas';
import { authValidation } from './auth.schemas';
import { marketplaceSchema } from './marketplace.schemas';
import {
  paginationSchema,
  stringValidations,
  numberValidations,
  fileValidations,
  queryParams,
  refinements
} from './common.schemas';

// Export grouped schemas
export const schemas = {
  user: userValidation,
  auth: authValidation,
  marketplace: marketplaceSchema,
  common: {
    pagination: paginationSchema,
    string: stringValidations,
    number: numberValidations,
    file: fileValidations,
    query: queryParams,
    refinements
  }
} as const;

// Common validation utilities
export function validateSchema<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data);
}

export function validateSync<T>(schema: z.Schema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validatePartial<T extends z.AnyZodObject>(
  schema: T,
  data: unknown
): Promise<Partial<z.infer<T>>> {
  const partialSchema = z.object(
    Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => [
        key,
        value instanceof z.ZodType ? value.optional() : value
      ])
    )
  ) as z.ZodObject<any>;

  return partialSchema.parseAsync(data);
}

// Type utilities
export type Infer<T extends z.ZodType> = z.infer<T>;
export type PartialInfer<T extends z.ZodType> = Partial<z.infer<T>>;

// Validation error formatters
export function formatZodError(error: z.ZodError): Array<{
  path: string[];
  message: string;
}> {
  return error.errors.map(err => ({
    path: err.path.map(p => String(p)),
    message: err.message
  }));
}

// Validation result types
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    path: string[];
    message: string;
  }>;
}

// Data transformers
export const transforms = {
  trimmedString: z.string().trim(),
  normalizedEmail: z.string().email().toLowerCase().trim(),
  safeInteger: z.string().regex(/^\d+$/).transform(Number),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  boolean: z.enum(['true', 'false']).transform(v => v === 'true')
} as const;

// Validation helpers
export function coerceNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

export function coerceBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function coerceArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

// Validation middleware factory
export const createValidator = <T extends z.ZodType>(schema: T) => {
  return async (data: unknown): Promise<ValidationResult<z.infer<T>>> => {
    try {
      const validated = await schema.parseAsync(data);
      return {
        success: true,
        data: validated
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: formatZodError(error)
        };
      }
      throw error;
    }
  };
};

// Re-export types
export type {
  ValidationResult,
  ValidationSchema
} from '../types/validation';

// Export all validation schemas
export {
  userValidation,
  authValidation,
  marketplaceSchema,
  paginationSchema,
  stringValidations,
  numberValidations,
  fileValidations,
  queryParams,
  refinements
};
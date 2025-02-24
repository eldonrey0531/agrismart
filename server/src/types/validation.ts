import { z } from 'zod';
import {
  TypedRequest,
  TypedResponse,
  RequestHandler as ExpressRequestHandler
} from './express-extension';

// Base validation types
export interface ValidationSchema<T = any> {
  validate: (data: unknown) => Promise<T>;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: string[];
  message: string;
  code?: string;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  context?: Record<string, any>;
}

// Schema types
export type ZodSchema = z.ZodType<any, any>;
export type InferSchema<T extends ZodSchema> = z.infer<T>;

// Custom validators
export interface CustomValidator<T> {
  (value: unknown, options?: ValidationOptions): Promise<T>;
}

export interface SyncValidator<T> {
  (value: unknown, options?: ValidationOptions): T;
}

// Nested validation
export interface NestedValidationError {
  [key: string]: ValidationError[] | NestedValidationError;
}

export interface NestedValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: NestedValidationError;
}

// Request validation
export interface RequestValidation<
  TBody = any,
  TQuery = any,
  TParams = any
> {
  body?: z.Schema<TBody>;
  query?: z.Schema<TQuery>;
  params?: z.Schema<TParams>;
}

// Schema builder types
export interface SchemaDefinition<T = any> {
  type: string;
  required?: boolean;
  nullable?: boolean;
  default?: T;
  validation?: Array<{
    rule: (value: T) => boolean;
    message: string;
  }>;
  transform?: (value: any) => T;
}

export interface ObjectSchemaDefinition {
  [key: string]: SchemaDefinition | ObjectSchemaDefinition;
}

// Schema factory types
export interface SchemaFactory<T = any> {
  create: (definition: SchemaDefinition) => ValidationSchema<T>;
  object: (definition: ObjectSchemaDefinition) => ValidationSchema<T>;
  array: (itemSchema: ValidationSchema) => ValidationSchema<T[]>;
  union: (schemas: ValidationSchema[]) => ValidationSchema<T>;
}

// Express middleware types
export interface RequestHandler<
  TBody = any,
  TQuery = any,
  TParams = any,
  TResponse = any
> extends ExpressRequestHandler {
  (
    req: TypedRequest<TBody, TQuery, TParams>,
    res: TypedResponse<TResponse>,
    next: (error?: any) => void
  ): void | Promise<void>;
}

// Validation middleware types
export interface ValidationMiddleware {
  <TBody = any, TQuery = any, TParams = any>(
    schema: RequestValidation<TBody, TQuery, TParams>
  ): RequestHandler<TBody, TQuery, TParams>;
}

// Validation context
export interface ValidationContext {
  path: string[];
  value: any;
  parent?: any;
  options?: ValidationOptions;
}

// Error formatter types
export interface ErrorFormatter {
  (error: z.ZodError): ValidationError[];
}

export interface ErrorCode {
  code: string;
  message: string;
}

// Validation rule types
export interface ValidationRule<T = any> {
  validate: (value: T, context?: ValidationContext) => boolean | Promise<boolean>;
  message: string | ((value: T, context?: ValidationContext) => string);
}

// Type predicates
export function isValidationError(error: any): error is ValidationError {
  return (
    error &&
    Array.isArray(error.path) &&
    typeof error.message === 'string'
  );
}

export function isNestedValidationError(error: any): error is NestedValidationError {
  return (
    error &&
    typeof error === 'object' &&
    Object.values(error).every(
      value =>
        Array.isArray(value) &&
        value.every(isValidationError) ||
        isNestedValidationError(value)
    )
  );
}

// Type utilities
export type ValidationFunction<T> = (value: unknown) => Promise<T>;
export type SyncValidationFunction<T> = (value: unknown) => T;

export type ValidateAsync = <T>(
  schema: ValidationSchema<T>,
  data: unknown,
  options?: ValidationOptions
) => Promise<T>;

export type ValidateSync = <T>(
  schema: ValidationSchema<T>,
  data: unknown,
  options?: ValidationOptions
) => T;

// Schema transformation types
export type Transform<T, U> = (value: T) => U | Promise<U>;
export type Predicate = (value: unknown) => boolean;

// Validation result helpers
export const isSuccess = <T>(
  result: ValidationResult<T>
): result is ValidationResult<T> & { success: true; data: T } => {
  return result.success === true;
};

export const isFailure = <T>(
  result: ValidationResult<T>
): result is ValidationResult<T> & { success: false; errors: ValidationError[] } => {
  return result.success === false;
};
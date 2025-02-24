import type { ErrorMessages } from './test-config';
import type { ErrorResponse } from './response-types';

/**
 * Common error types
 */
export const ErrorType = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

/**
 * Error status codes
 */
export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0,
} as const;

export type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];

/**
 * Error details interface
 */
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  status: HttpStatus;
  data?: Record<string, unknown>;
}

/**
 * Error message types
 */
export type AuthErrorMessage = keyof ErrorMessages['auth'] | string;
export type NetworkErrorMessage = keyof ErrorMessages['network'] | string;

export type { ErrorResponse };

export default {
  ErrorType,
  HttpStatus,
};
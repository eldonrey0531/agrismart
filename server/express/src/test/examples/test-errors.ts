import TEST_CONFIG from './test-config';
import {
  ErrorType,
  HttpStatus,
  type ErrorDetails,
  type AuthErrorMessage,
  type NetworkErrorMessage,
  type ErrorResponse,
} from './error-types';

/**
 * Error factory
 */
const createError = (
  type: ErrorType,
  message: string,
  status: HttpStatus,
  data?: Record<string, unknown>
): ErrorResponse => ({
  success: false,
  type,
  message,
  ...(data && { data }),
});

/**
 * Common errors
 */
export const ErrorFactory = {
  validation: (field: string, message: string) =>
    createError(
      ErrorType.VALIDATION,
      TEST_CONFIG.errors.validation.invalid(field),
      HttpStatus.BAD_REQUEST,
      { field, message }
    ),

  required: (field: string) =>
    createError(
      ErrorType.VALIDATION,
      TEST_CONFIG.errors.validation.required(field),
      HttpStatus.BAD_REQUEST,
      { field }
    ),

  invalidCredentials: () =>
    createError(
      ErrorType.AUTHENTICATION,
      TEST_CONFIG.errors.auth.invalidCredentials,
      HttpStatus.UNAUTHORIZED
    ),

  unauthorized: (message: AuthErrorMessage = 'unauthorized') =>
    createError(
      ErrorType.AUTHORIZATION,
      message in TEST_CONFIG.errors.auth
        ? TEST_CONFIG.errors.auth[message as keyof typeof TEST_CONFIG.errors.auth]
        : message,
      HttpStatus.UNAUTHORIZED
    ),

  notFound: (resource: string) =>
    createError(
      ErrorType.NOT_FOUND,
      `${resource} not found`,
      HttpStatus.NOT_FOUND,
      { resource }
    ),

  rateLimit: (retryAfter: number) =>
    createError(
      ErrorType.RATE_LIMIT,
      TEST_CONFIG.errors.auth.rateLimitExceeded,
      HttpStatus.TOO_MANY_REQUESTS,
      { retryAfter }
    ),

  network: (message: NetworkErrorMessage = 'timeout') =>
    createError(
      ErrorType.NETWORK,
      message in TEST_CONFIG.errors.network
        ? TEST_CONFIG.errors.network[message as keyof typeof TEST_CONFIG.errors.network]
        : message,
      HttpStatus.NETWORK_ERROR
    ),

  server: (message = 'Internal server error') =>
    createError(
      ErrorType.SERVER,
      message,
      HttpStatus.SERVER_ERROR
    ),
};

/**
 * Error predicates
 */
export const ErrorGuards = {
  isValidation: (error: ErrorResponse): boolean =>
    error.type === ErrorType.VALIDATION,

  isAuthentication: (error: ErrorResponse): boolean =>
    error.type === ErrorType.AUTHENTICATION,

  isAuthorization: (error: ErrorResponse): boolean =>
    error.type === ErrorType.AUTHORIZATION,

  isNotFound: (error: ErrorResponse): boolean =>
    error.type === ErrorType.NOT_FOUND,

  isRateLimit: (error: ErrorResponse): boolean =>
    error.type === ErrorType.RATE_LIMIT,

  isNetwork: (error: ErrorResponse): boolean =>
    error.type === ErrorType.NETWORK,

  isServer: (error: ErrorResponse): boolean =>
    error.type === ErrorType.SERVER,
};

/**
 * Error utilities
 */
export const ErrorUtils = {
  create: createError,
  factory: ErrorFactory,
  is: ErrorGuards,
  type: ErrorType,
  status: HttpStatus,
};

export default ErrorUtils;
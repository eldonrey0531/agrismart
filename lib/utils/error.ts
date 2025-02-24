/**
 * Error utilities for consistent error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL: "INTERNAL",
  VALIDATION: "VALIDATION",
  SYNC_FAILED: "SYNC_FAILED",
  OFFLINE: "OFFLINE",
} as const;

export type ErrorCode = keyof typeof ErrorCodes;

/**
 * Get a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Create an AppError from various error types
 */
export function createAppError(
  error: unknown,
  defaultMessage = "An unexpected error occurred",
  defaultCode: ErrorCode = "INTERNAL",
  defaultStatus = 500
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = getErrorMessage(error) || defaultMessage;
  return new AppError(message, defaultCode, defaultStatus, error);
}

/**
 * Nature-themed error messages
 */
export const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: "Like a seed without soil, authentication is required",
  [ErrorCodes.BAD_REQUEST]: "Like mismatched seeds, your request isn't quite right",
  [ErrorCodes.NOT_FOUND]: "Like searching for water in a desert, we couldn't find what you're looking for",
  [ErrorCodes.CONFLICT]: "Like two plants competing for sunlight, a conflict occurred",
  [ErrorCodes.INTERNAL]: "Like a storm in the garden, something went wrong",
  [ErrorCodes.VALIDATION]: "Like weeds in a garden, we found some issues",
  [ErrorCodes.SYNC_FAILED]: "Like a failed harvest, sync couldn't complete",
  [ErrorCodes.OFFLINE]: "Like a garden during drought, we're offline",
} as const;

/**
 * Create common error responses
 */
export const Errors = {
  unauthorized: (message = ErrorMessages.UNAUTHORIZED) =>
    new AppError(message, ErrorCodes.UNAUTHORIZED, 401),

  badRequest: (message = ErrorMessages.BAD_REQUEST, details?: unknown) =>
    new AppError(message, ErrorCodes.BAD_REQUEST, 400, details),

  notFound: (message = ErrorMessages.NOT_FOUND) =>
    new AppError(message, ErrorCodes.NOT_FOUND, 404),

  conflict: (message = ErrorMessages.CONFLICT) =>
    new AppError(message, ErrorCodes.CONFLICT, 409),

  internal: (message = ErrorMessages.INTERNAL, details?: unknown) =>
    new AppError(message, ErrorCodes.INTERNAL, 500, details),

  validation: (message = ErrorMessages.VALIDATION, details?: unknown) =>
    new AppError(message, ErrorCodes.VALIDATION, 422, details),

  syncFailed: (message = ErrorMessages.SYNC_FAILED, details?: unknown) =>
    new AppError(message, ErrorCodes.SYNC_FAILED, 500, details),

  offline: (message = ErrorMessages.OFFLINE) =>
    new AppError(message, ErrorCodes.OFFLINE, 503),
} as const;

/**
 * Check if an error is a specific type
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isNotFoundError(error: unknown): boolean {
  return isAppError(error) && error.code === ErrorCodes.NOT_FOUND;
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAppError(error) && error.code === ErrorCodes.UNAUTHORIZED;
}

export function isValidationError(error: unknown): boolean {
  return isAppError(error) && error.code === ErrorCodes.VALIDATION;
}

export function isSyncError(error: unknown): boolean {
  return isAppError(error) && error.code === ErrorCodes.SYNC_FAILED;
}
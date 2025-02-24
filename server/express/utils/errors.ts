export interface ErrorDetails {
  code?: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  [key: string]: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(
    message: string,
    details?: ErrorDetails,
    statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = details?.code || 'INTERNAL_ERROR';
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, {
      code: 'VALIDATION_ERROR',
      ...details,
    }, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: ErrorDetails) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      ...details,
    }, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: ErrorDetails) {
    super(message, {
      code: 'AUTHORIZATION_ERROR',
      ...details,
    }, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: ErrorDetails) {
    super(message, {
      code: 'NOT_FOUND',
      ...details,
    }, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(message, {
      code: 'CONFLICT_ERROR',
      ...details,
    }, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: ErrorDetails) {
    super(message, {
      code: 'RATE_LIMIT_ERROR',
      ...details,
    }, 429);
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: ErrorDetails) {
    super(message, {
      code: 'SERVER_ERROR',
      ...details,
    }, 500);
  }
}
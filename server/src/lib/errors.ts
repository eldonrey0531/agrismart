export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(409, message, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: Record<string, any>) {
    super(500, message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'Service request failed', details?: Record<string, any>) {
    super(502, `${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', details);
    this.name = 'ExternalServiceError';
  }
}

export const throwError = {
  // HTTP status code based errors
  badRequest: (message: string, details?: Record<string, any>) => {
    throw new AppError(400, message, 'BAD_REQUEST', details);
  },

  unauthorized: (message: string = 'Unauthorized') => {
    throw new AppError(401, message, 'UNAUTHORIZED');
  },

  forbidden: (message: string = 'Forbidden') => {
    throw new AppError(403, message, 'FORBIDDEN');
  },

  notFound: (resource: string = 'Resource') => {
    throw new NotFoundError(resource);
  },

  conflict: (message: string, details?: Record<string, any>) => {
    throw new ConflictError(message, details);
  },

  server: (message: string = 'Internal server error', details?: Record<string, any>) => {
    throw new AppError(500, message, 'INTERNAL_SERVER_ERROR', details);
  },

  // Domain specific errors
  validation: (message: string, details?: Record<string, any>) => {
    throw new ValidationError(message, details);
  },

  authentication: (message?: string) => {
    throw new AuthenticationError(message);
  },

  authorization: (message?: string) => {
    throw new AuthorizationError(message);
  },

  database: (message?: string, details?: Record<string, any>) => {
    throw new DatabaseError(message, details);
  },

  externalService: (service: string, message?: string, details?: Record<string, any>) => {
    throw new ExternalServiceError(service, message, details);
  },

  custom: (statusCode: number, message: string, code: string, details?: Record<string, any>) => {
    throw new AppError(statusCode, message, code, details);
  }
};

// HTTP Status Code constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_SERVICE: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST'
} as const;

// Type exports
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// Error factory
export const createError = (code: ErrorCode, message: string, details?: Record<string, any>): AppError => {
  switch (code) {
    case ERROR_CODES.VALIDATION:
      return new ValidationError(message, details);
    case ERROR_CODES.AUTHENTICATION:
      return new AuthenticationError(message);
    case ERROR_CODES.AUTHORIZATION:
      return new AuthorizationError(message);
    case ERROR_CODES.NOT_FOUND:
      return new NotFoundError(message);
    case ERROR_CODES.CONFLICT:
      return new ConflictError(message, details);
    case ERROR_CODES.DATABASE:
      return new DatabaseError(message, details);
    case ERROR_CODES.EXTERNAL_SERVICE:
      return new ExternalServiceError('Unknown', message, details);
    default:
      return new AppError(500, message, code, details);
  }
};
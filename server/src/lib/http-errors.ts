export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'HTTP_ERROR',
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request', details?: Record<string, any>) {
    super(400, message, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, details?: Record<string, any>) {
    super(409, message, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: Record<string, any>) {
    super(422, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ServerError extends HttpError {
  constructor(message: string = 'Internal Server Error', details?: Record<string, any>) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'ServerError';
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message: string = 'Service Unavailable') {
    super(503, message, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

// Error factory utility
export const throwHttpError = {
  badRequest: (message: string, details?: Record<string, any>) => {
    throw new BadRequestError(message, details);
  },

  unauthorized: (message?: string) => {
    throw new UnauthorizedError(message);
  },

  forbidden: (message?: string) => {
    throw new ForbiddenError(message);
  },

  notFound: (resource?: string) => {
    throw new NotFoundError(resource);
  },

  conflict: (message: string, details?: Record<string, any>) => {
    throw new ConflictError(message, details);
  },

  validation: (message: string, details?: Record<string, any>) => {
    throw new ValidationError(message, details);
  },

  server: (message?: string, details?: Record<string, any>) => {
    throw new ServerError(message, details);
  },

  serviceUnavailable: (message?: string) => {
    throw new ServiceUnavailableError(message);
  }
};

// Error type guards
export const isHttpError = (error: any): error is HttpError => {
  return error instanceof HttpError;
};

export const isBadRequestError = (error: any): error is BadRequestError => {
  return error instanceof BadRequestError;
};

export const isUnauthorizedError = (error: any): error is UnauthorizedError => {
  return error instanceof UnauthorizedError;
};

export const isForbiddenError = (error: any): error is ForbiddenError => {
  return error instanceof ForbiddenError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isConflictError = (error: any): error is ConflictError => {
  return error instanceof ConflictError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isServerError = (error: any): error is ServerError => {
  return error instanceof ServerError;
};

// Error status code mapping
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Error code mapping
export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;
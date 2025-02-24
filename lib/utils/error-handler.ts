export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'ApiException';
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}

export class ValidationException extends ApiException {
  constructor(errors: any[]) {
    super('Validation failed', 400, errors);
    this.name = 'ValidationException';
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

export class AuthenticationException extends ApiException {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationException';
    Object.setPrototypeOf(this, AuthenticationException.prototype);
  }
}

export class AuthorizationException extends ApiException {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationException';
    Object.setPrototypeOf(this, AuthorizationException.prototype);
  }
}

export class NotFoundException extends ApiException {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundException';
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

// Error handler function for API routes
export async function handleApiError(error: unknown): Promise<{ statusCode: number; message: string; errors?: any[] }> {
  console.error('API Error:', error);

  if (error instanceof ApiException) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message || 'Internal server error'
    };
  }

  return {
    statusCode: 500,
    message: 'An unknown error occurred'
  };
}
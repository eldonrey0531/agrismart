export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack: string = '',
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new ApiError(400, message, true, '', errors);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Not found') {
    return new ApiError(404, message);
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, false);
  }
}
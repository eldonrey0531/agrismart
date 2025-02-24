import { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any,
    public metadata: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.metadata.timestamp = new Date().toISOString();
    this.metadata.statusCode = statusCode;
  }
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ErrorService {
  public static handleApiError(error: AxiosError<unknown>): AppError {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as { error?: { message?: string; code?: string; details?: any } };
      
      if (data.error) {
        return new AppError(
          data.error.message || 'An error occurred',
          data.error.code || 'API_ERROR',
          error.response.status,
          data.error.details
        );
      }
    }
    
    if (error.response) {
      return new AppError(
        'An error occurred while processing your request',
        'API_ERROR',
        error.response.status
      );
    }
    
    if (error.request) {
      return new AppError(
        'No response received from server',
        'NETWORK_ERROR',
        0,
        { originalError: error.message }
      );
    }
    
    return new AppError(
      'Failed to make request',
      'REQUEST_SETUP_ERROR',
      0,
      { originalError: error.message }
    );
  }

  public static createError(
    message: string,
    code = 'INTERNAL_ERROR',
    statusCode = 500,
    details?: any
  ): AppError {
    return new AppError(message, code, statusCode, details);
  }

  public static isAppError(error: any): error is AppError {
    return error instanceof AppError;
  }

  public static formatError(error: Error | AppError): ApiErrorResponse {
    if (this.isAppError(error)) {
      return {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    return {
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: null,
      },
    };
  }
}
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: {
    code?: string;
    details?: Record<string, string[]>;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiValidationErrorResponse extends ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    details: Record<string, string[]>;
  };
}

export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorDetails {
  code?: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}
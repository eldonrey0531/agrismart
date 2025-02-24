/**
 * API Error Detail
 */
export interface ApiErrorDetail {
  field?: string;
  code?: string;
  message: string;
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  status: number;
  metadata?: Record<string, unknown>;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  status: number;
  code?: string;
  details?: ApiErrorDetail[];
  metadata?: Record<string, unknown>;
}

/**
 * Combined API Response
 */
export type ApiResponse<T = any> = 
  | ApiSuccessResponse<T>
  | ApiErrorResponse;

/**
 * Error Codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
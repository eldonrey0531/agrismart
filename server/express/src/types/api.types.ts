/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  statusCode?: number;
  timestamp?: string;
}

/**
 * Rate limit error response
 */
export interface RateLimitError {
  success: boolean;
  error: string;
  code: string;
  statusCode: number;
  retryAfter?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
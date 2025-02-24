// Import all type modules
import * as HttpTypes from './http';
import * as ConfigTypes from './config';
import * as MarketTypes from './marketplace';
import * as ExpressTypes from './express-extension';

// Re-export grouped types
export { HttpTypes, ConfigTypes, MarketTypes, ExpressTypes };

// Re-export HTTP types
export {
  ApiResponse,
  ApiError,
  AppError,
  HTTP_STATUS,
  ERROR_CODES,
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
  ValidationError,
  ServiceResponse
} from './http';

// Re-export config types
export {
  Environment,
  EnvVars,
  ProcessedEnv,
  AppConfig,
  FeatureFlag,
  LogLevel,
  ConfigSchema
} from './config';

// Re-export marketplace types
export {
  ProductWithSeller,
  CategoryWithRelations,
  CategoryStats,
  MarketplaceStats,
  OrderStats,
  SellerStats,
  CreateReviewInput,
  UpdateProductInput,
  SearchParams,
  ProductFilters,
  CACHE_KEYS
} from './marketplace';

// Re-export express extension types
export {
  TypedRequest,
  TypedResponse,
  RequestWithAuth,
  RequestWithFile,
  FileWithUrl,
  StorageEngine,
  MulterError
} from './express-extension';

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CacheConfig {
  ttl: number;
  prefix?: string;
  serialize?: boolean;
}

export interface QueueJob {
  id: string;
  type: string;
  data: Record<string, any>;
  priority?: number;
  attempts?: number;
  delay?: number;
}

export interface QueueConfig {
  name: string;
  concurrency?: number;
  timeout?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

export interface HealthCheckResult {
  status: 'ok' | 'error';
  component: string;
  details?: Record<string, any>;
}

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_CACHE_TTL = 3600; // 1 hour
export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Type utilities for common patterns
export type NonNullable<T> = Exclude<T, null | undefined>;

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type RequireOnlyOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & 
    Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

// Type aliases for convenience
export type HttpStatus = typeof HttpTypes.HTTP_STATUS[keyof typeof HttpTypes.HTTP_STATUS];
export type ErrorCode = typeof HttpTypes.ERROR_CODES[keyof typeof HttpTypes.ERROR_CODES];
export type CacheTTL = typeof MarketTypes.CACHE_KEYS;
export type ValidationResult = HttpTypes.ValidationError[];
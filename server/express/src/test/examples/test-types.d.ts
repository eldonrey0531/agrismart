import type { TestConfig } from './test-config';

/**
 * Test Data Types
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginData {
  user: TestUser;
  token: string;
}

/**
 * Response Types
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Test Helper Types
 */
export interface TestSetupOptions {
  name?: string;
  timeout?: number;
  rateLimits?: Partial<RateLimitInfo>;
  headers?: Record<string, string>;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface TestHelper {
  setup(options?: TestSetupOptions): TestHelper;
  cleanup(): void;
  mockSuccess<T>(data: T, init?: Partial<ResponseInit>): SuccessResponse<T>;
  mockError(error: {
    type: string;
    message: string;
    status?: number;
    data?: Record<string, unknown>;
  }): ErrorResponse;
  mockRateLimitExceeded(): ErrorResponse;
  mockNetworkError(message?: string): Error;
  getHeaders(): Record<string, string>;
  getRateLimits(): RateLimitInfo | undefined;
  useRateLimit(count?: number): RateLimitInfo | undefined;
  waitForRateLimit(): Promise<void>;
  readonly testName: string | undefined;
}

/**
 * Auth Assertions Types
 */
export interface AuthAssertions {
  assertSuccessfulLogin(
    response: Response,
    expectedUser?: TestUser
  ): Promise<SuccessResponse<LoginData>>;

  assertInvalidCredentials(
    response: Response
  ): Promise<ErrorResponse>;

  assertRateLimit(
    limits: { remaining: number } | undefined,
    expectedRemaining: number
  ): void;

  assertRateLimitExceeded(
    response: Response
  ): Promise<ErrorResponse>;

  assertRequestHeaders(
    response: Response
  ): void;

  assertErrorResponse(
    response: Response,
    expectedError: {
      type: string;
      message: string;
      status: number;
    }
  ): Promise<ErrorResponse>;

  createLoginRequest(
    credentials: {
      email: string;
      password: string;
    }
  ): Request;
}

/**
 * Factory Functions
 */
export interface TestHelperFactory {
  (config?: Partial<TestConfig>): TestHelper;
}

export interface AuthAssertionsFactory {
  (helper: TestHelper, config?: Partial<TestConfig>): AuthAssertions;
}

// Re-export types for convenience
export type {
  TestConfig,
};
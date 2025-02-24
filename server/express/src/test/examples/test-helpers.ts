import { jest } from '@jest/globals';
import testEnv, { ENV } from './test-env';
import { createTestUtils } from './test-types';
import type { RateLimitInfo, MockResponseInit } from './test-types';

/**
 * Mock response types
 */
interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Test helper class
 */
export class TestHelper {
  private utils = createTestUtils();
  private currentTest?: string;

  /**
   * Initialize test environment
   */
  setup(options: {
    name?: string;
    timeout?: number;
    rateLimits?: Partial<RateLimitInfo>;
    headers?: Record<string, string>;
  } = {}) {
    this.currentTest = options.name;

    // Configure timeout
    if (options.timeout) {
      testEnv.config.setTimeout(options.timeout);
    }

    // Set default headers
    const headers = { ...ENV.security.headers };
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    this.utils.setHeaders(headers);

    // Set rate limits
    const defaultLimits = testEnv.rateLimits.createDefault();
    if (options.rateLimits) {
      const limits = { ...defaultLimits };
      Object.assign(limits, options.rateLimits);
      this.utils.setRateLimits(limits);
    } else {
      this.utils.setRateLimits(defaultLimits);
    }

    return this;
  }

  /**
   * Clean up test environment
   */
  cleanup() {
    testEnv.config.resetTimeout();
    this.utils.clearHeaders();
    this.utils.resetRateLimits();
    this.utils.resetFetchMocks();
    jest.clearAllMocks();
    jest.clearAllTimers();
    this.currentTest = undefined;
  }

  /**
   * Create response init with default headers
   */
  private createResponseInit(init: Partial<MockResponseInit> = {}): MockResponseInit {
    const headers = {
      'Content-Type': 'application/json',
      ...this.utils.getHeaders(),
    };

    if (init.headers) {
      Object.assign(headers, init.headers);
    }

    return {
      status: init.status ?? 200,
      headers,
    };
  }

  /**
   * Mock successful response
   */
  mockSuccess<T = unknown>(data: T, init?: Partial<MockResponseInit>): SuccessResponse<T> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
    };

    this.utils.mockFetchResponse(response, this.createResponseInit(init));
    return response;
  }

  /**
   * Mock error response
   */
  mockError(config: {
    type: string;
    message: string;
    status?: number;
    data?: Record<string, unknown>;
  }): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      type: config.type,
      message: config.message,
    };

    if (config.data) {
      response.data = config.data;
    }

    this.utils.mockFetchResponse(response, this.createResponseInit({
      status: config.status ?? 400,
    }));

    return response;
  }

  /**
   * Mock rate limit exceeded
   */
  mockRateLimitExceeded(): ErrorResponse {
    const limits = testEnv.rateLimits.createExceeded();
    this.utils.setRateLimits(limits);

    return this.mockError({
      type: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
      status: 429,
      data: {
        retryAfter: limits.retryAfter,
      },
    });
  }

  /**
   * Mock network error
   */
  mockNetworkError(message = 'Network Error'): Error {
    const error = new Error(message);
    this.utils.mockFetchNetworkError();
    return error;
  }

  /**
   * Get current headers
   */
  getHeaders(): Record<string, string> {
    return this.utils.getHeaders();
  }

  /**
   * Get current rate limits
   */
  getRateLimits(): RateLimitInfo | undefined {
    return this.utils.getRateLimits();
  }

  /**
   * Use rate limit
   */
  useRateLimit(count = 1): RateLimitInfo | undefined {
    this.utils.updateRateLimits(count);
    return this.getRateLimits();
  }

  /**
   * Wait for rate limit reset
   */
  async waitForRateLimit(): Promise<void> {
    const limits = this.getRateLimits();
    if (limits?.reset) {
      const waitMs = (limits.reset - testEnv.time.now()) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitMs));
      this.utils.setRateLimits(testEnv.rateLimits.createDefault());
    }
  }

  /**
   * Get test name
   */
  get testName(): string | undefined {
    return this.currentTest;
  }
}

/**
 * Create test helper
 */
export function createTestHelper(): TestHelper {
  return new TestHelper();
}

export type {
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
};

export default createTestHelper;
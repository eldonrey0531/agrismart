import { beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';
import TEST_CONFIG from '../test-config';
import { createTestUtils } from './test-types';
import type { RateLimitInfo } from './test-types';

/**
 * Initialize test utilities
 */
if (!global.__TEST_UTILS__) {
  global.__TEST_UTILS__ = createTestUtils();
}

/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMITS: RateLimitInfo = {
  limit: TEST_CONFIG.rateLimits.auth.maxAttempts,
  remaining: TEST_CONFIG.rateLimits.auth.maxAttempts,
  reset: Math.floor(Date.now() / 1000) + TEST_CONFIG.rateLimits.auth.windowMs / 1000,
};

/**
 * Test setup hooks
 */
export function setupTest(options: {
  timeout?: number;
  rateLimits?: Partial<RateLimitInfo>;
  headers?: Record<string, string>;
} = {}) {
  beforeAll(() => {
    // Configure test timeout
    jest.setTimeout(options.timeout ?? TEST_CONFIG.api.timeout);

    // Set default headers
    global.__TEST_UTILS__.setHeaders({
      ...TEST_CONFIG.security.headers,
      ...options.headers,
    });

    // Set rate limits
    global.__TEST_UTILS__.setRateLimits({
      ...DEFAULT_RATE_LIMITS,
      ...options.rateLimits,
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    global.__TEST_UTILS__.resetFetchMocks();
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Reset test configuration
    jest.setTimeout(5000); // Reset to default timeout
    global.__TEST_UTILS__.clearHeaders();
    global.__TEST_UTILS__.resetRateLimits();
  });
}

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Sleep for specified duration
   */
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Wait for rate limit reset
   */
  async waitForRateLimitReset() {
    const limits = global.__TEST_UTILS__.getRateLimits();
    if (limits?.reset) {
      const now = Math.floor(Date.now() / 1000);
      const waitMs = Math.max(0, (limits.reset - now) * 1000);
      await testUtils.sleep(waitMs);
      global.__TEST_UTILS__.setRateLimits({
        ...DEFAULT_RATE_LIMITS,
        reset: Math.floor(Date.now() / 1000) + TEST_CONFIG.rateLimits.auth.windowMs / 1000,
      });
    }
  },

  /**
   * Get current headers
   */
  getHeaders() {
    return global.__TEST_UTILS__.getHeaders();
  },

  /**
   * Get current rate limits
   */
  getRateLimits() {
    return global.__TEST_UTILS__.getRateLimits();
  },

  /**
   * Update rate limits
   */
  useRateLimit(used = 1) {
    global.__TEST_UTILS__.updateRateLimits(used);
  },
};

export default {
  setupTest,
  testUtils,
};
import { jest } from '@jest/globals';
import TEST_CONFIG from '../test-config';
import type { RateLimitInfo } from './test-types';

/**
 * Test environment configuration
 */
export const ENV = {
  /**
   * API configuration
   */
  api: {
    baseUrl: TEST_CONFIG.api.baseUrl,
    timeout: TEST_CONFIG.api.timeout,
    paths: TEST_CONFIG.api.paths,
  },

  /**
   * Security configuration
   */
  security: {
    headers: TEST_CONFIG.security.headers,
    jwt: TEST_CONFIG.security.jwt,
  },

  /**
   * Rate limiting configuration
   */
  rateLimits: {
    auth: TEST_CONFIG.rateLimits.auth,
    api: TEST_CONFIG.rateLimits.api,
  },

  /**
   * Mock data
   */
  mocks: {
    users: TEST_CONFIG.mockData.users,
    tokens: TEST_CONFIG.mockData.tokens,
  },
} as const;

/**
 * Test environment utilities
 */
export const testEnv = {
  /**
   * Timer management
   */
  timers: {
    useFake() {
      jest.useFakeTimers();
    },
    useReal() {
      jest.useRealTimers();
    },
    advance(ms: number) {
      jest.advanceTimersByTime(ms);
    },
    runAll() {
      jest.runAllTimers();
    },
    runPending() {
      jest.runOnlyPendingTimers();
    },
  },

  /**
   * Date/Time utilities
   */
  time: {
    now() {
      return Math.floor(Date.now() / 1000);
    },
    future(seconds: number) {
      return testEnv.time.now() + seconds;
    },
    past(seconds: number) {
      return testEnv.time.now() - seconds;
    },
  },

  /**
   * Rate limit factories
   */
  rateLimits: {
    createDefault(): RateLimitInfo {
      return {
        limit: ENV.rateLimits.auth.maxAttempts,
        remaining: ENV.rateLimits.auth.maxAttempts,
        reset: testEnv.time.future(ENV.rateLimits.auth.windowMs / 1000),
      };
    },
    createExceeded(): RateLimitInfo {
      return {
        limit: ENV.rateLimits.auth.maxAttempts,
        remaining: 0,
        reset: testEnv.time.future(ENV.rateLimits.auth.blockDuration / 1000),
        retryAfter: ENV.rateLimits.auth.blockDuration / 1000,
      };
    },
  },

  /**
   * Authentication utilities
   */
  auth: {
    getValidToken() {
      return ENV.mocks.tokens.valid;
    },
    getExpiredToken() {
      return ENV.mocks.tokens.expired;
    },
    getInvalidToken() {
      return ENV.mocks.tokens.invalid;
    },
    getHeaders(token = ENV.mocks.tokens.valid) {
      return {
        Authorization: `Bearer ${token}`,
      };
    },
  },

  /**
   * Test configuration
   */
  config: {
    setTimeout(ms: number) {
      jest.setTimeout(ms);
    },
    resetTimeout() {
      jest.setTimeout(5000);
    },
  },
} as const;

export default testEnv;
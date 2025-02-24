import { expect } from '@jest/globals';

/**
 * Rate limit header names
 */
export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
  RETRY_AFTER: 'Retry-After',
} as const;

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Rate limit assertion helpers
 */
export const rateLimitAssert = {
  /**
   * Extract rate limit info from response headers
   */
  getRateLimits: (response: Response): RateLimitInfo => {
    const headers = response.headers;
    const limit = Number(headers.get(RATE_LIMIT_HEADERS.LIMIT));
    const remaining = Number(headers.get(RATE_LIMIT_HEADERS.REMAINING));
    const reset = Number(headers.get(RATE_LIMIT_HEADERS.RESET));
    const retryAfter = headers.get(RATE_LIMIT_HEADERS.RETRY_AFTER);

    return {
      limit,
      remaining,
      reset,
      ...(retryAfter && { retryAfter: Number(retryAfter) }),
    };
  },

  /**
   * Assert rate limit headers exist
   */
  hasRateLimitHeaders: (response: Response) => {
    const headers = response.headers;
    Object.values(RATE_LIMIT_HEADERS).forEach(header => {
      expect(headers.has(header)).toBe(true);
    });
  },

  /**
   * Assert rate limit values are valid
   */
  validRateLimits: (info: RateLimitInfo) => {
    expect(info.limit).toBeGreaterThan(0);
    expect(info.remaining).toBeLessThanOrEqual(info.limit);
    expect(info.remaining).toBeGreaterThanOrEqual(0);
    expect(info.reset).toBeGreaterThan(Date.now() / 1000);

    if (info.retryAfter !== undefined) {
      expect(info.retryAfter).toBeGreaterThan(0);
    }

    return info;
  },

  /**
   * Assert rate limit values match expected
   */
  matchesExpected: (
    info: RateLimitInfo,
    expected: Partial<RateLimitInfo>
  ) => {
    Object.entries(expected).forEach(([key, value]) => {
      expect(info[key as keyof RateLimitInfo]).toBe(value);
    });
    return info;
  },

  /**
   * Assert rate limit decrease
   */
  decremented: (before: RateLimitInfo, after: RateLimitInfo) => {
    expect(after.limit).toBe(before.limit);
    expect(after.remaining).toBe(before.remaining - 1);
    expect(after.reset).toBeGreaterThanOrEqual(before.reset);
  },

  /**
   * Assert rate limit exceeded
   */
  exceeded: (response: Response) => {
    expect(response.status).toBe(429);
    expect(response.headers.has(RATE_LIMIT_HEADERS.RETRY_AFTER)).toBe(true);
    
    const info = rateLimitAssert.getRateLimits(response);
    expect(info.remaining).toBe(0);
    expect(info.retryAfter).toBeGreaterThan(0);

    return info;
  },

  /**
   * Helper to wait for rate limit reset
   */
  waitForReset: async (info: RateLimitInfo) => {
    const now = Date.now() / 1000;
    const waitMs = Math.max(0, (info.reset - now) * 1000);
    await new Promise(resolve => setTimeout(resolve, waitMs));
  },
};

export default rateLimitAssert;
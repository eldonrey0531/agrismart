import { expect } from '@jest/globals';
import { validateResponse } from '../assertions';
import type { ApiResponse } from '../types';

/**
 * Error response shape
 */
export interface ErrorDetails {
  status: number;
  type: string;
  message?: string;
}

/**
 * Response assertion helpers
 */
export const assertResponse = {
  /**
   * Assert successful response
   */
  success: async <T = unknown>(
    response: Response,
    expectedData?: T,
    status = 200
  ) => {
    const data = await validateResponse.success<T>(response, expectedData, status);
    expect(response.status).toBe(status);
    expect(response.ok).toBe(true);
    return data;
  },

  /**
   * Assert error response
   */
  error: async (response: Response, error: ErrorDetails) => {
    const data = await response.json() as ApiResponse;
    expect(response.status).toBe(error.status);
    expect(response.ok).toBe(false);
    expect(data).toEqual({
      success: false,
      type: error.type,
      ...(error.message && { message: error.message }),
    });
    return data;
  },

  /**
   * Assert request headers
   */
  headers: (
    response: Response,
    expectedHeaders: Record<string, string | undefined>
  ) => {
    Object.entries(expectedHeaders).forEach(([key, value]) => {
      if (value === undefined) {
        expect(response.headers.has(key)).toBe(false);
      } else {
        expect(response.headers.get(key)).toBe(value);
      }
    });
  },

  /**
   * Assert request was called with options
   */
  requestCalled: (
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ) => {
    const expectedOptions: Record<string, any> = {};
    if (options.method) expectedOptions.method = options.method;
    if (options.headers) expectedOptions.headers = expect.objectContaining(options.headers);
    if (options.body) expectedOptions.body = JSON.stringify(options.body);

    expect(global.mockFetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining(expectedOptions)
    );
  },

  /**
   * Assert request was not called
   */
  requestNotCalled: (url?: string) => {
    if (url) {
      expect(global.mockFetch).not.toHaveBeenCalledWith(url, expect.anything());
    } else {
      expect(global.mockFetch).not.toHaveBeenCalled();
    }
  },

  /**
   * Assert auth header
   */
  authHeader: (response: Response, token: string) => {
    assertResponse.headers(response, {
      Authorization: `Bearer ${token}`,
    });
  },

  /**
   * Assert content type
   */
  contentType: (response: Response, type = 'application/json') => {
    assertResponse.headers(response, {
      'Content-Type': type,
    });
  },
};

export default assertResponse;
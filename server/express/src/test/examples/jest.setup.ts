import { expect } from '@jest/globals';
import type { ApiResponse, ErrorResponse } from './response-types';
import type { ErrorDetails } from './test-matchers';

/**
 * Type guards
 */
const isApiResponse = (data: unknown): data is ApiResponse => {
  return typeof data === 'object' && data !== null && 'success' in data;
};

const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return isApiResponse(data) && !data.success && 'type' in data;
};

/**
 * Mock fetch implementation
 */
const mockFetch = jest.fn() as jest.Mock<Promise<Response>>;
global.mockFetch = mockFetch;
global.fetch = mockFetch;

/**
 * Reset mocks between tests
 */
beforeEach(() => {
  mockFetch.mockClear();
});

/**
 * Custom Jest matchers
 */
expect.extend({
  /**
   * Assert successful response
   */
  async toBeSuccessResponse(received: Response, expectedData?: unknown) {
    const pass = received.ok && received.status === 200;

    if (pass && expectedData) {
      const data = await received.clone().json();
      if (!isApiResponse(data)) {
        return {
          pass: false,
          message: () => 'Response is not a valid API response',
        };
      }

      return {
        pass: JSON.stringify(data.data) === JSON.stringify(expectedData),
        message: () => `Expected response data to match ${JSON.stringify(expectedData)}`,
      };
    }

    return {
      pass,
      message: () =>
        pass
          ? 'Expected response not to be successful'
          : `Expected successful response (200), got ${received.status}`,
    };
  },

  /**
   * Assert error response
   */
  async toBeErrorResponse(
    received: Response,
    expectedError: ErrorDetails
  ) {
    const pass = received.status === expectedError.status && !received.ok;

    if (pass) {
      const data = await received.clone().json();
      if (!isErrorResponse(data)) {
        return {
          pass: false,
          message: () => 'Response is not a valid error response',
        };
      }

      return {
        pass: data.type === expectedError.type,
        message: () => `Expected error type ${expectedError.type}, got ${data.type}`,
      };
    }

    return {
      pass,
      message: () =>
        pass
          ? 'Expected response not to be an error'
          : `Expected error response (${expectedError.status}), got ${received.status}`,
    };
  },

  /**
   * Assert response type
   */
  toHaveResponseType<T>(
    received: ApiResponse<T>,
    type: 'success' | 'error'
  ) {
    const pass = type === 'success' ? received.success : !received.success;

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to be ${type}`
          : `Expected ${type} response, got ${received.success ? 'success' : 'error'}`,
    };
  },

  /**
   * Assert response data
   */
  toHaveResponseData(
    received: ApiResponse,
    expectedData: unknown
  ) {
    if (!received.success) {
      return {
        pass: false,
        message: () => 'Cannot check data on error response',
      };
    }

    const pass = JSON.stringify(received.data) === JSON.stringify(expectedData);

    return {
      pass,
      message: () =>
        pass
          ? 'Expected response data not to match'
          : `Expected response data to match ${JSON.stringify(expectedData)}`,
    };
  },

  /**
   * Assert error type
   */
  toHaveErrorType(
    received: ApiResponse,
    expectedType: string
  ) {
    if (!isErrorResponse(received)) {
      return {
        pass: false,
        message: () => 'Response is not an error response',
      };
    }

    const pass = received.type === expectedType;

    return {
      pass,
      message: () =>
        pass
          ? 'Expected error type not to match'
          : `Expected error type ${expectedType}, got ${received.type}`,
    };
  },

  /**
   * Assert header value
   */
  toHaveHeader(
    received: Response,
    header: string,
    value?: string
  ) {
    const headerValue = received.headers.get(header);
    const pass = value 
      ? headerValue === value
      : headerValue !== null;

    return {
      pass,
      message: () =>
        pass
          ? `Expected header "${header}" ${value ? `not to be "${value}"` : 'not to exist'}`
          : `Expected header "${header}" ${value ? `to be "${value}"` : 'to exist'}`,
    };
  },
});

export {};
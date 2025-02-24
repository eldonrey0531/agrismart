import type { ErrorResponse, ApiResponse } from './response-types';

/**
 * Error details for assertions
 */
export interface ErrorDetails {
  type: string;
  message?: string;
  status: number;
  data?: Record<string, unknown>;
}

/**
 * Custom matchers
 */
declare global {
  namespace jest {
    interface Matchers<R, T> {
      /**
       * Assert successful response
       */
      toBeSuccessResponse(data?: unknown): R;

      /**
       * Assert error response
       */
      toBeErrorResponse(error: ErrorDetails): R;

      /**
       * Assert response type
       */
      toHaveResponseType(type: 'success' | 'error'): R;

      /**
       * Assert response data
       */
      toHaveResponseData(data: unknown): R;

      /**
       * Assert error type
       */
      toHaveErrorType(type: string): R;

      /**
       * Assert header value
       */
      toHaveHeader(header: string, value?: string): R;
    }
  }
}

/**
 * Mock fetch type
 */
declare global {
  var mockFetch: jest.Mock<Promise<Response>, [input: RequestInfo | URL, init?: RequestInit]>;
}

export {};
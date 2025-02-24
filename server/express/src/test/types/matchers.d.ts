import type { Response } from 'supertest';

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Verify successful API response
       */
      toBeSuccessResponse(data: unknown, status?: number): R;

      /**
       * Verify error API response
       */
      toBeErrorResponse(error: {
        status: number;
        type: string;
        message?: string;
      }): R;

      /**
       * Check if response is valid API response
       */
      toBeValidResponse(): R;

      /**
       * Check error type
       */
      toHaveErrorType(type: string): R;

      /**
       * Check success message
       */
      toHaveSuccessMessage(message: string): R;
    }
  }
}

/**
 * API response types
 */
export interface ApiResponse {
  success: boolean;
  type?: string;
  message?: string;
  data?: unknown;
}

export type TestResponse = Response & {
  body: ApiResponse;
};

export interface CustomMatcherResult {
  pass: boolean;
  message(): string;
}
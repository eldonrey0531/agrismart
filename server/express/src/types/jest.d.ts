import type { TestResponse } from './test';

declare global {
  namespace jest {
    interface Matchers<R = void> {
      /**
       * Verifies that the response matches API response format
       */
      toBeValidResponse(): R;

      /**
       * Verifies that the response contains the specified error type
       */
      toHaveErrorType(type: string): R;

      /**
       * Verifies that the response contains the specified success message
       */
      toHaveSuccessMessage(message: string): R;
    }
  }
}

// Export empty to make this a module
export {};
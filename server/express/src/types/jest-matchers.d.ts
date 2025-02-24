import type { TestResponse } from './test';

/**
 * Custom matcher result type
 */
export interface MatcherResult {
  pass: boolean;
  message(): string;
}

/**
 * Custom matcher function type
 */
export type CustomMatcher<T = any, Args extends any[] = []> = 
  (received: T, ...args: Args) => MatcherResult;

/**
 * Custom matchers interface
 */
export interface CustomMatchers<R = void> {
  toBeValidResponse(): R;
  toHaveErrorType(type: string): R;
  toHaveSuccessMessage(message: string): R;
}

/**
 * Extend Jest globals
 */
declare global {
  namespace jest {
    interface AsymmetricMatchers extends CustomMatchers {}
    interface Matchers<R, T = unknown> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
    interface ExpectExtendMap {
      toBeValidResponse: CustomMatcher<TestResponse>;
      toHaveErrorType: CustomMatcher<TestResponse, [type: string]>;
      toHaveSuccessMessage: CustomMatcher<TestResponse, [message: string]>;
    }
  }
}

/**
 * Custom matcher map type for implementation
 */
export type TestResponseMatcherMap = {
  [K in keyof jest.ExpectExtendMap]: jest.ExpectExtendMap[K];
};

// Export types for convenience
export { TestResponse };
import type { TestResponse } from './test';

declare global {
  namespace jest {
    interface Matchers<R = boolean, T = unknown> {
      toBeValidResponse(): R;
      toHaveErrorType(type: string): R;
      toHaveSuccessMessage(message: string): R;
    }
  }
}

export interface CustomMatcherResult {
  pass: boolean;
  message(): string;
}

export interface CustomMatcher<T = unknown> {
  (received: T, ...args: any[]): CustomMatcherResult;
}

// Define the shape of our custom matchers for expect.extend()
export interface ExpectExtendMap {
  toBeValidResponse: CustomMatcher<TestResponse>;
  toHaveErrorType: CustomMatcher<TestResponse>;
  toHaveSuccessMessage: CustomMatcher<TestResponse>;
  [key: string]: CustomMatcher<any>;  // Add index signature for Jest
}

declare global {
  namespace jest {
    interface Expect extends ExpectExtendMap {}
    interface InverseAsymmetricMatchers extends ExpectExtendMap {}
  }
}

// Explicitly declare Jest's ExpectExtendMap to ensure compatibility
declare module 'jest' {
  interface ExpectExtendMap {
    [key: string]: CustomMatcher<any>;
  }
}

// This empty export makes this file a module
export {};

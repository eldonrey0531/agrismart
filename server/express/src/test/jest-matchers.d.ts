import type { TestResponse } from './test-types';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidResponse(): R;
      toHaveErrorType(type: string): R;
      toHaveSuccessMessage(message: string): R;
    }
  }
}

export interface MatcherResult {
  pass: boolean;
  message: () => string;
}

export interface MatcherContext {
  isNot: boolean;
  promise: string;
  utils: {
    matcherHint: (matcherName: string, received?: string, expected?: string) => string;
    printReceived: (value: unknown) => string;
    printExpected: (value: unknown) => string;
  };
}

// Helper types for our matchers
export type CustomMatcher<Args extends any[] = []> = 
  (this: MatcherContext, received: TestResponse, ...args: Args) => MatcherResult;

export type ExpectExtend = {
  toBeValidResponse: CustomMatcher;
  toHaveErrorType: CustomMatcher<[string]>;
  toHaveSuccessMessage: CustomMatcher<[string]>;
};
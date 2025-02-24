/// <reference types="jest" />

import type { TestResponse } from '../types/test';
import { isSuccessResponse, isErrorResponse } from '../types/api';

declare const expect: jest.Expect;
declare const describe: jest.Describe;
declare const test: jest.It;
declare const it: jest.It;
declare const beforeAll: jest.Hook;
declare const afterAll: jest.Hook;
declare const beforeEach: jest.Hook;
declare const afterEach: jest.Hook;
declare const jest: jest.Jest;

/**
 * Custom matchers
 */
interface CustomMatchers<R = unknown> {
  toBeValidResponse(): R;
  toHaveErrorType(type: string): R;
  toHaveSuccessMessage(message: string): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

/**
 * Setup custom matchers
 */
expect.extend({
  toBeValidResponse(received: TestResponse) {
    const hasStatus = typeof received.status === 'number';
    const hasBody = typeof received.body === 'object';
    const hasType = typeof received.type === 'string';
    const isValidBody = 'success' in received.body;

    const pass = hasStatus && hasBody && hasType && isValidBody;

    return {
      pass,
      message: () =>
        pass
          ? 'Expected response not to be a valid API response'
          : 'Expected response to be a valid API response',
    };
  },

  toHaveErrorType(received: TestResponse, expectedType: string) {
    const response = received.body;
    const pass = isErrorResponse(response) && response.error === expectedType;

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have error type "${expectedType}"`
          : `Expected response to have error type "${expectedType}" but got "${
              isErrorResponse(response) ? response.error : 'none'
            }"`,
    };
  },

  toHaveSuccessMessage(received: TestResponse, expectedMessage: string) {
    const response = received.body;
    const pass = isSuccessResponse(response) && response.message === expectedMessage;

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have success message "${expectedMessage}"`
          : `Expected response to have success message "${expectedMessage}" but got "${
              isSuccessResponse(response) ? response.message : 'none'
            }"`,
    };
  },
});

/**
 * Export Jest globals with proper types
 */
export {
  expect,
  describe,
  test,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  jest,
};

/**
 * Test environment utilities
 */
export function mockConsole(debug = false) {
  return {
    ...console,
    log: debug ? console.log : jest.fn(),
    debug: debug ? console.debug : jest.fn(),
    info: debug ? console.info : jest.fn(),
    warn: console.warn,
    error: console.error,
  };
}

/**
 * Setup test environment
 */
export function setupTestEnv() {
  beforeAll(async () => {
    // Add test initialization here
  });

  afterAll(async () => {
    // Add cleanup logic here
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
}

// Initialize test environment by default
setupTestEnv();

// Export type helpers
export type {
  TestResponse,
  CustomMatchers,
};
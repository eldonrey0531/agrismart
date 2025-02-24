import '@testing-library/jest-dom';
import type { TestResponse } from '../types/test';
import { isSuccessResponse, isErrorResponse } from '../types/api';
import type { CustomMatcherResult, ExpectExtendMap } from '../types/jest-custom';

/**
 * Custom matchers implementation
 */
const matchers = {
  toBeValidResponse(received: TestResponse): CustomMatcherResult {
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

  toHaveErrorType(received: TestResponse, expectedType: string): CustomMatcherResult {
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

  toHaveSuccessMessage(received: TestResponse, expectedMessage: string): CustomMatcherResult {
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
} satisfies ExpectExtendMap;

/**
 * Add custom matchers to Jest
 */
expect.extend(matchers);

/**
 * Test environment configuration
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.JWT_SECRET = 'test-secret-key';
process.env.COOKIE_SECRET = 'test-cookie-secret';

/**
 * Test timeout configuration
 */
jest.setTimeout(30000);

/**
 * Console mocking
 */
const mockConsole = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Apply console mocks if not in debug mode
if (!process.env.DEBUG) {
  global.console = mockConsole;
}

/**
 * Test lifecycle hooks
 */
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  process.removeAllListeners();
});

/**
 * Exports for tests
 */
export { isSuccessResponse, isErrorResponse };
export type { TestResponse, CustomMatcherResult };
import { expect } from '@jest/globals';
import type { Response } from 'supertest';
import type { TestResponse } from '../types/test';
import { isSuccessResponse } from '../types/api';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidResponse(): R;
      toHaveErrorType(type: string): R;
      toHaveSuccessMessage(message: string): R;
      toBeValidToken(): R;
    }
  }
}

expect.extend({
  toBeValidResponse(received: Response) {
    const pass = received && 
      typeof received.status === 'number' && 
      typeof received.body === 'object';

    return {
      pass,
      message: () => 
        pass
          ? 'Expected response not to be a valid API response'
          : 'Expected response to be a valid API response',
    };
  },

  toHaveErrorType(received: TestResponse, expectedType: string) {
    const pass = received.body.error === expectedType;

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have error type "${expectedType}"`
          : `Expected response to have error type "${expectedType}" but got "${received.body.error}"`,
    };
  },

  toHaveSuccessMessage(received: TestResponse, expectedMessage: string) {
    const pass = isSuccessResponse(received.body) && 
      received.body.message === expectedMessage;

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have success message "${expectedMessage}"`
          : `Expected response to have success message "${expectedMessage}" but got "${received.body.message}"`,
    };
  },

  toBeValidToken(received: string) {
    const parts = received.split('.');
    const pass = parts.length === 3 && 
      parts.every(part => part.length > 0);

    return {
      pass,
      message: () =>
        pass
          ? 'Expected string not to be a valid JWT token'
          : 'Expected string to be a valid JWT token',
    };
  },
});

// Clear database and reset mocks before each test
beforeEach(async () => {
  // Add database cleanup logic here if needed
  jest.clearAllMocks();
});

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Add global teardown
afterAll(async () => {
  // Add global cleanup logic here if needed
});
import type { MatcherFunction } from 'expect';
import type { jest } from '@jest/globals';

declare global {
  // Extend global with Jest types
  const describe: typeof jest.describe;
  const it: typeof jest.it;
  const expect: typeof jest.expect;
  const beforeAll: typeof jest.beforeAll;
  const afterAll: typeof jest.afterAll;
  const beforeEach: typeof jest.beforeEach;
  const afterEach: typeof jest.afterEach;
  const jest: typeof import('@jest/globals').jest;

  namespace jest {
    interface Matchers<R> {
      toBeValidResponse(): R;
      toHaveErrorType(type: string): R;
      toHaveSuccessMessage(message: string): R;
    }
  }
}

// Make this a module
export {};
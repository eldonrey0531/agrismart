import { jest, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import type { Config } from '@jest/types';
import type { Mock } from 'jest-mock';
import testUtils from './helpers';
import type { ApiResponse } from './types';

/**
 * Environment configuration
 */
const env = {
  NODE_ENV: 'test',
  JWT_SECRET: 'test-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};

/**
 * Mock response types
 */
interface MockResponse extends Omit<Response, 'json'> {
  json(): Promise<ApiResponse>;
}

type FetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<MockResponse>;

/**
 * Global type augmentation
 */
declare global {
  interface Window {
    fetch: FetchImplementation;
  }
  
  interface Console {
    __original__?: {
      log: typeof console.log;
      error: typeof console.error;
      warn: typeof console.warn;
      info: typeof console.info;
      debug: typeof console.debug;
    };
  }

  var mockFetch: Mock<FetchImplementation>;
}

/**
 * Mock implementations
 */
const mockFetch: FetchImplementation = async (input, init) => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => ({ success: true, data: null }),
  } as MockResponse;
};

// Set up global fetch mock
global.mockFetch = jest.fn(mockFetch);
global.fetch = global.mockFetch as unknown as typeof fetch;

/**
 * Console mocking
 */
console.__original__ = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

beforeAll(() => {
  // Mock console methods
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();

  // Set test environment
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
});

afterAll(() => {
  // Restore console methods
  if (console.__original__) {
    console.log = console.__original__.log;
    console.error = console.__original__.error;
    console.warn = console.__original__.warn;
    console.info = console.__original__.info;
    console.debug = console.__original__.debug;
    delete console.__original__;
  }

  // Clean up environment
  Object.keys(env).forEach((key) => {
    delete process.env[key];
  });
});

/**
 * Test lifecycle hooks
 */
beforeEach(() => {
  // Reset timers and mocks
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore timers and clean up
  jest.useRealTimers();
  global.mockFetch.mockClear();
});

/**
 * Custom matcher types
 */
interface CustomMatchers<R = boolean> {
  toBeSuccessResponse(data?: unknown, status?: number): R;
  toBeErrorResponse(error: {
    status: number;
    type: string;
    message?: string;
  }): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

/**
 * Custom matchers
 */
expect.extend({
  toBeSuccessResponse(received: MockResponse, data?: unknown, status = 200) {
    const pass = received.status === status;
    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to be successful with status ${status}`
          : `Expected response to be successful with status ${status}`,
    };
  },

  toBeErrorResponse(
    received: MockResponse,
    { status, type, message }: { status: number; type: string; message?: string }
  ) {
    const pass = received.status === status;
    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to be an error with status ${status}, type ${type}`
          : `Expected response to be an error with status ${status}, type ${type}`,
    };
  },
});

/**
 * Jest configuration
 */
export const config: Config.InitialOptions = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.test.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  clearMocks: true,
};

export default config;
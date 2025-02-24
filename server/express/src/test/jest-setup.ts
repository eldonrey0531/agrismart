import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { matchers } from './matchers';

/**
 * Extend Jest matchers
 */
expect.extend(matchers);

/**
 * Mock globals
 */
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = jest.fn();
global.Request = jest.fn() as any;
global.Response = jest.fn() as any;

/**
 * Mock console methods
 */
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

/**
 * Mock date and time
 */
beforeEach(() => {
  // Set fixed date
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

/**
 * Set timezone
 */
process.env.TZ = 'UTC';

/**
 * Mock environment variables
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Advance time by milliseconds
   */
  advanceTime: (ms: number) => {
    jest.advanceTimersByTime(ms);
    jest.runAllTimers();
  },

  /**
   * Set system time
   */
  setTime: (date: Date | number | string) => {
    jest.setSystemTime(new Date(date));
  },

  /**
   * Reset console mocks
   */
  resetConsoleMocks: () => {
    (console.log as jest.Mock).mockClear();
    (console.error as jest.Mock).mockClear();
    (console.warn as jest.Mock).mockClear();
    (console.info as jest.Mock).mockClear();
    (console.debug as jest.Mock).mockClear();
  },

  /**
   * Reset fetch mocks
   */
  resetFetchMocks: () => {
    (global.fetch as jest.Mock).mockClear();
  },

  /**
   * Mock fetch success
   */
  mockFetchSuccess: (data: unknown, init: ResponseInit = {}) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        ...init,
      })
    );
  },

  /**
   * Mock fetch error
   */
  mockFetchError: (status: number, data: unknown = {}) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  },

  /**
   * Mock fetch network error
   */
  mockFetchNetworkError: (error: Error = new Error('Network error')) => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);
  },
};

export default testUtils;
import NodeEnvironment from 'jest-environment-node';
import type { Config } from '@jest/types';
import type { JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';
import { TextEncoder, TextDecoder } from 'util';

/**
 * Global DOM types for Fetch API
 */
interface FetchTypes {
  Response: typeof Response;
  Request: typeof Request;
  Headers: typeof Headers;
  fetch: typeof fetch;
}

/**
 * Custom Jest test environment
 */
class CustomEnvironment extends NodeEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
  }

  async setup() {
    await super.setup();

    // Configure timezone
    this.global.process.env.TZ = 'UTC';

    // Configure test environment
    Object.assign(this.global.process.env, {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    });

    // Mock Fetch API
    const createResponse = (body: unknown, init?: ResponseInit) => {
      return new Response(
        typeof body === 'string' ? body : JSON.stringify(body),
        {
          headers: { 'Content-Type': 'application/json' },
          ...init,
        }
      );
    };

    this.global.fetch = jest.fn(async (input: string | URL | Request, init?: RequestInit) => {
      return createResponse({ message: 'Mocked response' });
    });

    // Add native fetch types
    this.global.Response = Response;
    this.global.Request = Request;
    this.global.Headers = Headers;

    // Mock console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();

    // Store original console methods for teardown
    this.global.__ORIGINAL_CONSOLE__ = originalConsole;

    // Add test helpers
    this.global.__TEST_UTILS__ = {
      mockFetchResponse: (body: unknown, init?: ResponseInit) => {
        (this.global.fetch as jest.Mock).mockImplementationOnce(async () => 
          createResponse(body, init)
        );
      },
      mockFetchError: (error: Error) => {
        (this.global.fetch as jest.Mock).mockRejectedValueOnce(error);
      },
      mockFetchNetworkError: () => {
        (this.global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      },
      resetFetchMocks: () => {
        (this.global.fetch as jest.Mock).mockClear();
      },
    };
  }

  async teardown() {
    // Restore console methods
    const originalConsole = this.global.__ORIGINAL_CONSOLE__;
    if (originalConsole) {
      Object.assign(console, originalConsole);
    }

    // Clear all mocks
    jest.clearAllMocks();

    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }

  /**
   * Handle test runtime errors
   */
  handleTestEvent(event: { name: string; test?: unknown }) {
    if (event.name === 'test_start') {
      // Reset timers for each test
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    }

    if (event.name === 'test_done') {
      // Restore timers after each test
      jest.useRealTimers();
    }
  }
}

/**
 * Environment type declaration
 */
declare global {
  namespace NodeJS {
    interface Global extends FetchTypes {
      TextEncoder: typeof TextEncoder;
      TextDecoder: typeof TextDecoder;
      fetch: jest.Mock;
      __ORIGINAL_CONSOLE__: {
        log: typeof console.log;
        error: typeof console.error;
        warn: typeof console.warn;
        info: typeof console.info;
        debug: typeof console.debug;
      };
      __TEST_UTILS__: {
        mockFetchResponse: (body: unknown, init?: ResponseInit) => void;
        mockFetchError: (error: Error) => void;
        mockFetchNetworkError: () => void;
        resetFetchMocks: () => void;
      };
    }
  }
}

export default CustomEnvironment;
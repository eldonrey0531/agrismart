import type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  MockResponse,
  MockResponseInit,
  TestContext,
} from './types';

/**
 * Create mock response
 */
export function createMockResponse(
  body: unknown,
  init: MockResponseInit = {}
): MockResponse {
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body);
  const response = new Response(responseBody, {
    status: init.status || 200,
    statusText: init.statusText,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  return {
    ...response,
    json: () => Promise.resolve(body as ApiResponse),
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  init: MockResponseInit = {}
): MockResponse {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  return createMockResponse(body, { status: 200, ...init });
}

/**
 * Create error response
 */
export function createErrorResponse(
  type: string,
  message: string,
  init: MockResponseInit = {}
): MockResponse {
  const body: ApiErrorResponse = {
    success: false,
    type,
    message,
  };
  return createMockResponse(body, { status: 400, ...init });
}

/**
 * Create test context
 */
export function createTestContext(overrides: Partial<TestContext> = {}): TestContext {
  return {
    req: new Request('http://localhost') as any,
    res: createMockResponse({ success: true, data: null }),
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      ...overrides.env,
    },
    ...overrides,
  };
}

/**
 * Mock fetch utilities
 */
export const mockFetch = {
  /**
   * Mock success response
   */
  success: <T>(data: T, init?: MockResponseInit) => {
    const response = createSuccessResponse(data, init);
    global.fetch = jest.fn().mockResolvedValue(response);
    return response;
  },

  /**
   * Mock error response
   */
  error: (type: string, message: string, init?: MockResponseInit) => {
    const response = createErrorResponse(type, message, init);
    global.fetch = jest.fn().mockResolvedValue(response);
    return response;
  },

  /**
   * Mock network error
   */
  networkError: (error: Error = new Error('Network error')) => {
    global.fetch = jest.fn().mockRejectedValue(error);
    return error;
  },

  /**
   * Reset fetch mock
   */
  reset: () => {
    (global.fetch as jest.Mock).mockReset();
  },
};

/**
 * Timer utilities
 */
export const mockTime = {
  /**
   * Set current time
   */
  set: (date: Date | string | number) => {
    jest.setSystemTime(new Date(date));
  },

  /**
   * Advance time by milliseconds
   */
  advance: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },

  /**
   * Reset timers
   */
  reset: () => {
    jest.useRealTimers();
  },
};

/**
 * Test utilities
 */
export const testUtils = {
  response: {
    create: createMockResponse,
    success: createSuccessResponse,
    error: createErrorResponse,
  },
  context: createTestContext,
  fetch: mockFetch,
  time: mockTime,
};

export default testUtils;
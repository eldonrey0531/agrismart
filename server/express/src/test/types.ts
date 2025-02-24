import type { Mock } from 'jest-mock';

/**
 * API Response types
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Request/Response types
 */
export interface ExtendedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface MockResponse extends Omit<Response, 'json'> {
  json(): Promise<ApiResponse>;
}

/**
 * Mock Function types
 */
export type MockFn = jest.Mock;
export type TypedMockFn<TArgs extends any[] = any[], TReturn = any> = 
  jest.Mock<TReturn, TArgs>;

export type FetchMock = TypedMockFn<
  [input: string | URL | Request, init?: RequestInit | undefined],
  Promise<MockResponse>
>;

/**
 * Test utilities
 */
export interface TestUtils {
  mockFetchResponse(body: unknown, init?: ResponseInit): void;
  mockFetchError(error: Error): void;
  mockFetchNetworkError(): void;
  resetFetchMocks(): void;
}

/**
 * Console mock type
 */
export interface ConsoleMock {
  log: MockFn;
  error: MockFn;
  warn: MockFn;
  info: MockFn;
  debug: MockFn;
}

/**
 * Environment globals
 */
export interface TestGlobals {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
  fetch: FetchMock;
  Response: typeof Response;
  Request: typeof Request;
  Headers: typeof Headers;
  __TEST_UTILS__: TestUtils;
  __ORIGINAL_CONSOLE__: ConsoleMock;
}

/**
 * Test environment options
 */
export interface TestOptions {
  mockDate?: Date | string | number;
  clearConsole?: boolean;
  mockEnv?: Record<string, string>;
}

/**
 * Type guards
 */
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> => response.success;

export const isErrorResponse = (
  response: ApiResponse
): response is ApiErrorResponse => !response.success;

/**
 * Test context
 */
export interface TestContext {
  req: ExtendedRequest;
  res: MockResponse;
  env: Record<string, string>;
}

/**
 * Mock matcher result
 */
export interface CustomMatcherResult {
  pass: boolean;
  message(): string;
}

/**
 * Mock response data
 */
export interface MockResponseInit extends ResponseInit {
  json?: () => Promise<ApiResponse>;
}

/**
 * Extensions for global scope
 */
declare global {
  // Add TestUtils to global scope
  var __TEST_UTILS__: TestUtils;
  var __ORIGINAL_CONSOLE__: ConsoleMock;
}

export const testUtils = {
  isSuccessResponse,
  isErrorResponse,
} as const;

export default testUtils;
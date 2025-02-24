/// <reference types="jest" />

declare global {
  namespace jest {
    type MockedFn<T extends (...args: any[]) => any> = {
      (...args: Parameters<T>): ReturnType<T>;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn: T): this;
      mockImplementationOnce(fn: T): this;
      mockReturnThis(): this;
      mockReturnValue(value: ReturnType<T>): this;
      mockReturnValueOnce(value: ReturnType<T>): this;
      mockResolvedValue(value: Awaited<ReturnType<T>>): this;
      mockResolvedValueOnce(value: Awaited<ReturnType<T>>): this;
      mockRejectedValue(value: unknown): this;
      mockRejectedValueOnce(value: unknown): this;
      getMockName(): string;
      mock: {
        calls: Parameters<T>[];
        instances: any[];
        contexts: any[];
        results: { type: 'return' | 'throw'; value: any }[];
        lastCall: Parameters<T>;
      };
    };
  }
}

export interface TestResponse {
  statusCode: number;
  responseBody: any;
}

export interface TestRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  token?: string;
  user?: any;
}

export interface TestContext {
  request: TestRequestOptions;
  response: TestResponse;
}

export interface MockResponse {
  status: jest.MockedFn<(code: number) => any>;
  json: jest.MockedFn<(body: any) => any>;
  send: jest.MockedFn<(body: any) => any>;
  cookie?: jest.MockedFn<(name: string, value: string, options?: any) => any>;
  clearCookie?: jest.MockedFn<(name: string, options?: any) => any>;
  [key: string]: any;
}

export interface MockRequest {
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
  headers: Record<string, string>;
  user?: any;
  cookies?: Record<string, string>;
  [key: string]: any;
}

export type TestErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
};

export type TestSuccessResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
};
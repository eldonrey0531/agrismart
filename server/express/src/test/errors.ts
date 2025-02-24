import type { Request, Response, NextFunction } from 'express';
import type { TestResponse } from '../types/test';
import type { ApiErrorResponse } from '../types/api';
import type { Middleware } from './middleware';

/**
 * Error test helper types
 */
export interface ErrorTestParams {
  status: number;
  message?: string;
  type?: string;
  data?: Record<string, any>;
}

/**
 * Mock Express types
 */
export interface MockRequest extends Partial<Request> {
  user?: any;
  headers: Record<string, string>;
}

export interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
  locals: Record<string, any>;
}

export interface MockNext extends jest.Mock<NextFunction> {}

/**
 * Create mock request
 */
export function createMockRequest(override: Partial<MockRequest> = {}): MockRequest {
  return {
    headers: {},
    ...override,
  };
}

/**
 * Create mock response
 */
export function createMockResponse(): MockResponse {
  const res: Partial<MockResponse> = {
    locals: {},
  };

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res as MockResponse;
}

/**
 * Create mock next function
 */
export function createMockNext(): MockNext {
  return jest.fn();
}

/**
 * Test middleware with proper async handling
 */
export async function testMiddleware(
  middleware: Middleware,
  params: {
    req?: Partial<MockRequest>;
    res?: Partial<MockResponse>;
    expectedError?: ErrorTestParams;
  } = {}
) {
  const req = createMockRequest(params.req);
  const res = createMockResponse();
  const next = createMockNext();

  // Handle both sync and async middleware
  await Promise.resolve(middleware(req as Request, res as Response, next));

  if (params.expectedError) {
    const { status, message, type, data } = params.expectedError;
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status,
        ...(message && { message: expect.stringContaining(message) }),
        ...(type && { type }),
        ...(data && { data: expect.objectContaining(data) }),
      })
    );
  } else {
    expect(next).toHaveBeenCalledWith();
  }

  return { req, res, next };
}

/**
 * Assert error response
 */
export function assertError(response: TestResponse, params: ErrorTestParams) {
  const { status, message, type, data } = params;

  expect(response.status).toBe(status);
  expect(response.body.success).toBe(false);

  const errorResponse = response.body as ApiErrorResponse;

  if (message) {
    expect(errorResponse.message).toContain(message);
  }

  if (type) {
    expect(errorResponse.error).toBe(type);
  }

  if (data && 'data' in errorResponse) {
    expect(errorResponse.data).toMatchObject(data);
  }
}

/**
 * Create error for testing
 */
export class TestError extends Error {
  constructor(
    public status: number,
    message: string,
    public type?: string,
    public data?: Record<string, any>
  ) {
    super(message);
    this.name = 'TestError';
  }
}

/**
 * Error factory
 */
export function createError(params: ErrorTestParams): TestError {
  return new TestError(params.status, params.message || '', params.type, params.data);
}

export default {
  createMockRequest,
  createMockResponse,
  createMockNext,
  testMiddleware,
  assertError,
  createError,
};
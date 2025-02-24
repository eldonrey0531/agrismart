import { Request, Response } from 'express';
import { JwtTestPayload } from './jwt';
import { UserDocument, UserRole } from '../../types/user';

interface MockRequest extends Partial<Request> {
  user?: UserDocument;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

interface MockResponse extends Partial<Response> {
  status: jest.MockedFunction<any>;
  json: jest.MockedFunction<any>;
  send: jest.MockedFunction<any>;
}

interface TestRequestConfig {
  user?: Partial<UserDocument>;
  token?: string;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

interface TestEndpointOptions {
  skipAuth?: boolean;
  mockUser?: boolean;
  validateRequest?: boolean;
}

/**
 * Create a mock request object for testing
 */
export function createMockRequest(config: TestRequestConfig = {}): MockRequest {
  return {
    user: config.user as UserDocument,
    headers: {
      'authorization': config.token ? `Bearer ${config.token}` : '',
      ...config.headers,
    },
    body: config.body || {},
    query: config.query || {},
    params: config.params || {},
  };
}

/**
 * Create a mock response object for testing
 */
export function createMockResponse(): MockResponse {
  const res: MockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
}

/**
 * Test an endpoint with proper request/response mocking
 */
export async function testEndpoint(
  handler: (req: Request, res: Response) => Promise<void>,
  config: TestRequestConfig = {},
  options: TestEndpointOptions = {}
) {
  const req = createMockRequest(config);
  const res = createMockResponse();

  await handler(req as Request, res as Response);

  return {
    req,
    res,
    statusCode: res.status.mock.calls[0]?.[0],
    responseBody: res.json.mock.calls[0]?.[0],
  };
}

/**
 * Create test error responses
 */
export const testErrors = {
  validation: {
    success: false,
    message: 'Validation error',
    errors: {
      field: ['Error message'],
    },
    timestamp: expect.any(String),
  },
  authentication: {
    success: false,
    message: 'Authentication required',
    timestamp: expect.any(String),
  },
  authorization: {
    success: false,
    message: 'Insufficient permissions',
    timestamp: expect.any(String),
  },
  notFound: {
    success: false,
    message: 'Resource not found',
    timestamp: expect.any(String),
  },
  server: {
    success: false,
    message: 'Internal server error',
    timestamp: expect.any(String),
  },
};

/**
 * Common test assertions
 */
export const assertEndpointBehavior = {
  requiresAuth: async (
    handler: (req: Request, res: Response) => Promise<void>,
    config: TestRequestConfig = {}
  ) => {
    const { statusCode, responseBody } = await testEndpoint(handler, config);
    expect(statusCode).toBe(401);
    expect(responseBody).toMatchObject(testErrors.authentication);
  },

  requiresAdmin: async (
    handler: (req: Request, res: Response) => Promise<void>,
    config: TestRequestConfig = {}
  ) => {
    const { statusCode, responseBody } = await testEndpoint(handler, {
      ...config,
      user: { role: UserRole.USER },
    });
    expect(statusCode).toBe(403);
    expect(responseBody).toMatchObject(testErrors.authorization);
  },

  handlesValidationErrors: async (
    handler: (req: Request, res: Response) => Promise<void>,
    config: TestRequestConfig = {}
  ) => {
    const { statusCode, responseBody } = await testEndpoint(handler, {
      ...config,
      body: {},
    });
    expect(statusCode).toBe(400);
    expect(responseBody.success).toBe(false);
    expect(responseBody.errors).toBeDefined();
  },
};

export const testEndpointUtils = {
  createMockRequest,
  createMockResponse,
  testEndpoint,
  testErrors,
  assertEndpointBehavior,
};
import { Request, Response, NextFunction } from 'express';
import { MockResponse, createMockResponse } from './mockResponse';
import { createMockRequest } from './mockRequest';
import { createErrorTests } from './errorTestUtils';
import TestFactory from './factories';
import type { TestUser } from './types';

type RouteHandler = (
  req: Request,
  res: MockResponse,
  next: NextFunction
) => Promise<void> | void;

interface RequestOptions {
  body?: Record<string, any>;
  query?: Record<string, any>;
  routeParams?: Record<string, any>;
  headers?: Record<string, string>;
  user?: TestUser | null;
  files?: any[];
}

interface RouteTestResult {
  req: ReturnType<typeof createMockRequest>;
  res: MockResponse;
  next: jest.Mock;
}

/**
 * Creates a test environment for a route handler
 */
export function createRouteTest(options: RequestOptions = {}): RouteTestResult {
  const {
    body = {},
    query = {},
    routeParams = {},
    headers = {},
    user = null,
    files = [],
  } = options;

  const req = createMockRequest({
    body,
    query,
    params: routeParams,
    headers,
    user,
    files,
  });

  const res = createMockResponse();
  const next = vi.fn();

  return { req, res, next };
}

/**
 * Executes a route handler with test parameters
 */
export async function executeRoute(
  handler: RouteHandler,
  options: RequestOptions = {}
): Promise<RouteTestResult> {
  const { req, res, next } = createRouteTest(options);

  try {
    await handler(req as Request, res, next);
  } catch (error) {
    next(error);
  }

  return { req, res, next };
}

/**
 * Creates a test suite for a route handler
 */
export function createRouteTests(handler: RouteHandler) {
  const errorTests = createErrorTests(handler);

  return {
    ...errorTests,

    async testSuccess(options: RequestOptions = {}) {
      const { res } = await executeRoute(handler, options);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toHaveProperty('success', true);
      return res;
    },

    async testValidation(invalidOptions: RequestOptions = {}) {
      const { res } = await executeRoute(handler, invalidOptions);
      expect(res.statusCode).toBe(400);
      expect(res._getData()).toHaveProperty('success', false);
      return res;
    },

    async testAuthentication(options: RequestOptions = {}) {
      const { res } = await executeRoute(handler, { ...options, user: null });
      expect(res.statusCode).toBe(401);
      expect(res._getData()).toHaveProperty('success', false);
      return res;
    },

    async testAuthorization(options: RequestOptions = {}) {
      const unauthorizedUser = await TestFactory.createUser({ role: 'user' });
      const { res } = await executeRoute(handler, { ...options, user: unauthorizedUser });
      expect(res.statusCode).toBe(403);
      expect(res._getData()).toHaveProperty('success', false);
      return res;
    },
  };
}

/**
 * Verifies pagination in route response
 */
export function verifyPagination(res: MockResponse, totalItems = 0): void {
  const data = res._getData();
  expect(data).toHaveProperty('page');
  expect(data).toHaveProperty('limit');
  expect(data).toHaveProperty('total');
  expect(data).toHaveProperty('data');
  expect(Array.isArray(data.data)).toBe(true);
  if (totalItems > 0) {
    expect(data.total).toBe(totalItems);
  }
}

interface CrudEndpoints {
  list?: RouteHandler;
  get?: RouteHandler;
  create?: RouteHandler;
  update?: RouteHandler;
  delete?: RouteHandler;
}

interface CrudTestConfig {
  endpoints: CrudEndpoints;
  itemName: string;
  createValidItem: () => Promise<any> | any;
  createInvalidItem: () => Promise<any> | any;
  setupTest?: () => Promise<void>;
  teardownTest?: () => Promise<void>;
}

/**
 * Creates common test cases for CRUD operations
 */
export function createCrudTests(config: CrudTestConfig) {
  const {
    endpoints,
    itemName,
    createValidItem,
    createInvalidItem,
    setupTest,
    teardownTest,
  } = config;

  const tests: Record<string, () => void> = {};

  if (endpoints.list) {
    tests[`List ${itemName}s`] = () => {
      describe(`List ${itemName}s`, () => {
        beforeEach(async () => {
          if (setupTest) await setupTest();
        });

        afterEach(async () => {
          if (teardownTest) await teardownTest();
        });

        it('should list all items', async () => {
          const { res } = await executeRoute(endpoints.list!);
          expect(res.statusCode).toBe(200);
          verifyPagination(res);
        });
      });
    };
  }

  if (endpoints.get) {
    tests[`Get ${itemName}`] = () => {
      describe(`Get ${itemName}`, () => {
        beforeEach(async () => {
          if (setupTest) await setupTest();
        });

        afterEach(async () => {
          if (teardownTest) await teardownTest();
        });

        it('should get a single item', async () => {
          const item = await createValidItem();
          const { res } = await executeRoute(endpoints.get!, {
            routeParams: { id: item.id },
          });
          expect(res.statusCode).toBe(200);
          expect(res._getData()).toHaveProperty('data');
        });
      });
    };
  }

  if (endpoints.create) {
    tests[`Create ${itemName}`] = () => {
      describe(`Create ${itemName}`, () => {
        beforeEach(async () => {
          if (setupTest) await setupTest();
        });

        afterEach(async () => {
          if (teardownTest) await teardownTest();
        });

        it('should create a new item', async () => {
          const validItem = await createValidItem();
          const { res } = await executeRoute(endpoints.create!, {
            body: validItem,
          });
          expect(res.statusCode).toBe(201);
        });

        it('should validate input', async () => {
          const invalidItem = await createInvalidItem();
          const { res } = await executeRoute(endpoints.create!, {
            body: invalidItem,
          });
          expect(res.statusCode).toBe(400);
        });
      });
    };
  }

  return tests;
}

export default {
  createRouteTest,
  executeRoute,
  createRouteTests,
  verifyPagination,
  createCrudTests,
};
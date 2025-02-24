import {
  createRouteTest,
  executeRoute,
  createRouteTests,
  verifyPagination,
  createCrudTests,
} from './routeTestUtils';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { TestUser } from './types';
import { BadRequestError } from '../../utils/app-error';
import { MockResponse } from './mockResponse';

const createTestUser = (role: 'user' | 'admin' = 'user'): TestUser => ({
  _id: new Types.ObjectId(),
  email: `test-${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User',
  role,
  status: 'active',
  verified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Route Test Utilities', () => {
  describe('createRouteTest', () => {
    test('creates test environment with defaults', () => {
      const { req, res, next } = createRouteTest();

      expect(req).toBeDefined();
      expect(res).toBeDefined();
      expect(next).toBeInstanceOf(Function);
      expect(req.body).toEqual({});
      expect(req.query).toEqual({});
      expect(req.params).toEqual({});
      expect(req.user).toBeNull();
    });

    test('creates test environment with custom options', () => {
      const testUser = createTestUser('user');
      const options = {
        body: { test: true },
        query: { page: '1' },
        routeParams: { id: '123' },
        headers: { 'content-type': 'application/json' },
        user: testUser,
      };

      const { req } = createRouteTest(options);

      expect(req.body).toEqual(options.body);
      expect(req.query).toEqual(options.query);
      expect(req.params).toEqual(options.routeParams);
      expect(req.headers['content-type']).toBe(options.headers['content-type']);
      expect(req.user).toEqual(options.user);
    });
  });

  describe('executeRoute', () => {
    const mockHandler = async (req: Request, res: MockResponse) => {
      res.status(200).json({ success: true, data: { test: true } });
    };

    test('executes successful route handler', async () => {
      const { res } = await executeRoute(mockHandler);

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual({
        success: true,
        data: { test: true },
      });
    });

    test('handles route errors', async () => {
      const errorHandler = () => {
        throw new BadRequestError('Test error');
      };

      const { next } = await executeRoute(errorHandler);

      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });
  });

  describe('createRouteTests', () => {
    const mockHandler = (req: Request, res: MockResponse, next: NextFunction) => {
      if (!req.user) {
        next(new Error('Unauthorized'));
        return;
      }
      if (req.user.role !== 'admin') {
        next(new Error('Forbidden'));
        return;
      }
      res.status(200).json({ success: true });
    };

    const routeTests = createRouteTests(mockHandler);

    test('tests successful execution', async () => {
      const adminUser = createTestUser('admin');
      const res = await routeTests.testSuccess({ user: adminUser });
      expect(res.statusCode).toBe(200);
    });

    test('tests authentication', async () => {
      const res = await routeTests.testAuthentication();
      expect(res.statusCode).toBe(401);
    });

    test('tests authorization', async () => {
      const res = await routeTests.testAuthorization();
      expect(res.statusCode).toBe(403);
    });
  });

  describe('verifyPagination', () => {
    test('verifies pagination structure', () => {
      const mockResponse = {
        _getData: () => ({
          page: 1,
          limit: 10,
          total: 100,
          data: [],
        }),
      } as MockResponse;

      expect(() => verifyPagination(mockResponse)).not.toThrow();
    });

    test('verifies pagination with total items', () => {
      const mockResponse = {
        _getData: () => ({
          page: 1,
          limit: 10,
          total: 50,
          data: Array(10).fill({}),
        }),
      } as MockResponse;

      expect(() => verifyPagination(mockResponse, 50)).not.toThrow();
    });
  });

  describe('createCrudTests', () => {
    const mockEndpoints = {
      list: async (_req: Request, res: MockResponse) => {
        res.status(200).json({
          success: true,
          page: 1,
          limit: 10,
          total: 0,
          data: [],
        });
      },
      get: async (req: Request, res: MockResponse) => {
        res.status(200).json({
          success: true,
          data: { id: req.params.id },
        });
      },
      create: async (req: Request, res: MockResponse) => {
        if (!req.body.name) {
          throw new BadRequestError('Name is required');
        }
        res.status(201).json({
          success: true,
          data: req.body,
        });
      },
    };

    const config = {
      endpoints: mockEndpoints,
      itemName: 'Item',
      createValidItem: () => ({ id: new Types.ObjectId().toString(), name: 'Test Item' }),
      createInvalidItem: () => ({ id: new Types.ObjectId().toString() }),
    };

    const tests = createCrudTests(config);

    test('creates list test', () => {
      expect(tests['List Items']).toBeDefined();
    });

    test('creates get test', () => {
      expect(tests['Get Item']).toBeDefined();
    });

    test('creates create test', () => {
      expect(tests['Create Item']).toBeDefined();
    });
  });
});
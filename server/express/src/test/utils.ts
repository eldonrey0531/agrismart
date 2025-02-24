import type { Request, Response, NextFunction } from 'express';
import type { User } from '@prisma/client';
import { errorTestUtils } from '../middleware/__tests__/error-test-utils';
import type { AuthService } from '../services/auth.service';

/**
 * Test types
 */
interface TestRequest extends Request {
  user?: User;
  [key: string]: any;
}

interface TestResponse {
  success: boolean;
  data?: any;
  error?: {
    type: string;
    message: string;
    data?: Record<string, any>;
  };
}

interface MockAuthService extends AuthService {
  verifyCredentials: jest.Mock;
  generateToken: jest.Mock;
  createUser: jest.Mock;
  verifyToken: jest.Mock;
  validatePassword: jest.Mock;
}

/**
 * Mock factories
 */
const mocks = {
  /**
   * Create mock request
   */
  request: (partial: Partial<TestRequest> = {}): TestRequest => {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      ...partial,
    } as TestRequest;
  },

  /**
   * Create mock response
   */
  response: () => {
    const res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      locals: {},
    };
    return res as unknown as Response;
  },

  /**
   * Create mock next function
   */
  next: () => jest.fn() as NextFunction,

  /**
   * Create mock auth service
   */
  authService: (): jest.Mocked<MockAuthService> => ({
    verifyCredentials: jest.fn(),
    generateToken: jest.fn(),
    createUser: jest.fn(),
    verifyToken: jest.fn(),
    validatePassword: jest.fn(),
  }),
};

/**
 * Test data
 */
const testData = {
  user: {
    basic: {
      id: 'user-1',
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'USER' as const,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    admin: {
      id: 'admin-1',
      email: 'admin@example.com',
      password: 'hashed-password',
      role: 'ADMIN' as const,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  },
  tokens: {
    valid: 'valid-jwt-token',
    expired: 'expired-jwt-token',
    invalid: 'invalid-jwt-token',
  },
  credentials: {
    valid: {
      email: 'test@example.com',
      password: 'ValidPass123',
    },
    invalid: {
      email: 'invalid@example.com',
      password: 'wrong-password',
    },
  },
};

/**
 * Test matchers
 */
const matchers = {
  /**
   * Assert successful response
   */
  toMatchSuccessResponse: (
    res: jest.Mocked<Response>,
    data: unknown,
    status = 200
  ) => {
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data,
    });
  },

  /**
   * Assert error response
   */
  toMatchErrorResponse: errorTestUtils.errorMatchers.toMatchErrorResponse,
};

/**
 * Environment utilities
 */
const env = {
  /**
   * Set test environment
   */
  setTestEnvironment: () => {
    const oldEnv = process.env;
    process.env = {
      ...oldEnv,
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
    };
    return () => {
      process.env = oldEnv;
    };
  },

  /**
   * Set development environment
   */
  setDevelopment: errorTestUtils.env.setDevelopment,

  /**
   * Set production environment
   */
  setProduction: errorTestUtils.env.setProduction,
};

/**
 * Test utilities
 */
const testUtils = {
  mocks,
  matchers,
  testData,
  env,
  errors: errorTestUtils.createTestError,
};

export type {
  TestRequest,
  TestResponse,
  MockAuthService,
};

export { testUtils, errorTestUtils };
export default testUtils;
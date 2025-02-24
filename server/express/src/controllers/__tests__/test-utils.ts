import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../../services/auth.service';
import type { User } from '@prisma/client';
import type { DeepPartial } from '../../types/utils';
import type { DbService } from '../../services/db.service';

/**
 * Extended request interface
 */
interface TestRequest extends Request {
  user?: User;
  [key: string]: any;
}

/**
 * Mock request factory
 */
const createMockRequest = (partial: DeepPartial<TestRequest> = {}): TestRequest => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...partial,
  } as TestRequest;
};

/**
 * Mock response factory
 */
const createMockResponse = (): jest.Mocked<Response> => {
  const res: DeepPartial<Response> = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    locals: {},
  };
  return res as jest.Mocked<Response>;
};

/**
 * Mock next function factory
 */
const createMockNext = (): jest.MockedFunction<NextFunction> => {
  return jest.fn();
};

/**
 * Mock database service factory
 */
const createMockDbService = (): jest.Mocked<DbService> => {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  } as jest.Mocked<DbService>;
};

/**
 * Mock auth service factory
 */
const createMockAuthService = (): jest.Mocked<AuthService> => {
  return {
    createUser: jest.fn(),
    verifyCredentials: jest.fn(),
    generateToken: jest.fn(),
    verifyToken: jest.fn(),
    validatePassword: jest.fn(),
  };
};

/**
 * Test response matchers
 */
const responseMatchers = {
  /**
   * Assert successful response
   */
  toHaveSuccessResponse: (
    res: jest.Mocked<Response>,
    data: unknown,
    status = 200
  ): void => {
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data,
    });
  },

  /**
   * Assert error response
   */
  toHaveErrorResponse: (
    next: jest.MockedFunction<NextFunction>,
    error: {
      status: number;
      type: string;
      message?: string;
    }
  ): void => {
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: error.status,
        type: error.type,
        ...(error.message && { message: error.message }),
      })
    );
  },
};

/**
 * Mock test data
 */
const mockData = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'USER' as const,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } satisfies User,

  admin: {
    id: 'admin-1',
    email: 'admin@example.com',
    password: 'hashed-password',
    role: 'ADMIN' as const,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } satisfies User,

  token: 'mock-jwt-token',
};

/**
 * Test utilities
 */
export const testUtils = {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createMockDbService,
  createMockAuthService,
  responseMatchers,
  mockData,
};

export type { TestRequest };
export default testUtils;
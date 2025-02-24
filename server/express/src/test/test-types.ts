import type { Request } from 'express';
import type { PrismaClient, User } from '@prisma/client';
import type { ApiResponse as BaseApiResponse, TestResponse as BaseTestResponse } from './types/matchers';

/**
 * Test request types
 */
export interface TestRequest extends Request {
  user?: User;
  [key: string]: any;
}

/**
 * Test environment options
 */
export interface TestEnvironmentOptions {
  mockDate?: Date | string;
  clearConsole?: boolean;
  mockEnv?: Record<string, string>;
}

/**
 * Test setup result
 */
export interface TestSetupResult {
  prisma: jest.Mocked<PrismaClient>;
  db: any;
  express: any;
  utils: any;
  cleanup: () => void;
}

/**
 * Re-export matcher types with aliases
 */
export type ApiResponseType = BaseApiResponse;
export type TestResponseType = BaseTestResponse;

/**
 * Test utilities types
 */
export interface TestUtilities {
  setup: {
    create: (options?: TestEnvironmentOptions) => TestSetupResult;
    reset: () => void;
    mockEnv: (env: Record<string, string>) => () => void;
  };
  mock: {
    createMock: <T>(template?: Partial<T>) => jest.Mocked<T>;
    mockEnv: (env: Record<string, string>) => () => void;
    mockDate: (date: Date | string | number) => () => void;
    mockConsole: () => () => void;
  };
  matchers: {
    toBeSuccessResponse: jest.CustomMatcher;
    toBeErrorResponse: jest.CustomMatcher;
    toBeValidResponse: jest.CustomMatcher;
    toHaveErrorType: jest.CustomMatcher;
    toHaveSuccessMessage: jest.CustomMatcher;
  };
}
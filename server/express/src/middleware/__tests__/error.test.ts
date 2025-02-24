import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import type { Request } from 'express';
import { errorHandler } from '../error';
import { errorTestUtils } from './error-test-utils';

describe('Error Handler Middleware', () => {
  // Mock console.error to avoid cluttering test output
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('AuthServiceError handling', () => {
    it('handles authentication errors', () => {
      const error = errorTestUtils.createTestError.auth(
        401,
        'UNAUTHORIZED',
        'Authentication failed'
      );
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 401,
        type: 'UNAUTHORIZED',
        message: 'Authentication failed',
      });
    });

    it('includes error data when present', () => {
      const error = errorTestUtils.createTestError.auth(
        400,
        'VALIDATION_ERROR',
        'Invalid input',
        { fields: ['email'] }
      );
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 400,
        type: 'VALIDATION_ERROR',
        message: 'Invalid input',
        data: { fields: ['email'] },
      });
    });
  });

  describe('Zod validation error handling', () => {
    it('handles Zod validation errors', () => {
      const error = errorTestUtils.createTestError.zodValidation();
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 400,
        type: 'VALIDATION_ERROR',
        message: 'Invalid input',
      });
    });
  });

  describe('Prisma error handling', () => {
    it('handles unique constraint violations', () => {
      const error = errorTestUtils.createTestError.prismaUnique(['email']);
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 409,
        type: 'DUPLICATE_ERROR',
        message: 'Resource already exists',
        data: { fields: ['email'] },
      });
    });

    it('handles not found errors', () => {
      const error = errorTestUtils.createTestError.prismaNotFound();
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 404,
        type: 'NOT_FOUND',
        message: 'Resource not found',
      });
    });

    it('handles validation errors', () => {
      const error = errorTestUtils.createTestError.prismaValidation();
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 400,
        type: 'VALIDATION_ERROR',
        message: 'Invalid database operation',
      });
    });
  });

  describe('JWT error handling', () => {
    it('handles invalid tokens', () => {
      const error = errorTestUtils.createTestError.jwtInvalid();
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 401,
        type: 'INVALID_TOKEN',
        message: 'Invalid token',
      });
    });

    it('handles expired tokens', () => {
      const error = errorTestUtils.createTestError.jwtExpired();
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 401,
        type: 'TOKEN_EXPIRED',
        message: 'Token expired',
      });
    });
  });

  describe('Unknown error handling', () => {
    it('handles unknown errors', () => {
      const error = new Error('Unexpected error');
      const res = errorTestUtils.createMockResponse();

      errorHandler(error, {} as Request, res, jest.fn());

      errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
        status: 500,
        type: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      });
    });

    it('includes error details in development', () => {
      const cleanup = errorTestUtils.env.setDevelopment();
      try {
        const error = new Error('Unexpected error');
        const res = errorTestUtils.createMockResponse();

        errorHandler(error, {} as Request, res, jest.fn());

        errorTestUtils.errorMatchers.toMatchErrorResponse(res, {
          status: 500,
          type: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          data: {
            name: 'Error',
            message: 'Unexpected error',
          },
        });
      } finally {
        cleanup();
      }
    });
  });
});
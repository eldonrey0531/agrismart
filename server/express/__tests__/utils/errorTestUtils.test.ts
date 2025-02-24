import {
  testErrorHandling,
  testBadRequest,
  testUnauthorized,
  testNotFound,
  testDatabaseError,
  verifyErrorResponse,
  errorAssertions,
  createErrorHandler,
  createErrorTests,
} from './errorTestUtils';
import { Request } from 'express';
import { MockResponse } from './mockResponse';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../utils/app-error';

describe('Error Test Utilities', () => {
  describe('testErrorHandling', () => {
    test('handles thrown errors', async () => {
      const error = new Error('Test error');
      const handler = () => { throw error; };

      const { next } = await testErrorHandling(handler, error);
      expect(next).toHaveBeenCalledWith(error);
    });

    test('handles async errors', async () => {
      const error = new Error('Test error');
      const handler = async () => { throw error; };

      const { next } = await testErrorHandling(handler, error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Error Type Tests', () => {
    const mockHandler = (req: Request, res: MockResponse) => {
      res.status(200).json({ success: true });
    };

    test('testBadRequest creates BadRequestError', async () => {
      const { next } = await testBadRequest(mockHandler);
      expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
    });

    test('testUnauthorized creates UnauthorizedError', async () => {
      const { next } = await testUnauthorized(mockHandler);
      expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    test('testNotFound creates NotFoundError', async () => {
      const { next } = await testNotFound(mockHandler);
      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    test('testDatabaseError creates Error', async () => {
      const { next } = await testDatabaseError(mockHandler);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('verifyErrorResponse', () => {
    test('verifies error response structure', () => {
      const res = {
        statusCode: 400,
        _getData: () => ({
          success: false,
          error: 'Test error',
        }),
      } as MockResponse;

      expect(() => verifyErrorResponse(res, 400, 'Test error')).not.toThrow();
    });

    test('fails if status code does not match', () => {
      const res = {
        statusCode: 400,
        _getData: () => ({
          success: false,
          error: 'Test error',
        }),
      } as MockResponse;

      expect(() => verifyErrorResponse(res, 401, 'Test error')).toThrow();
    });
  });

  describe('errorAssertions', () => {
    let res: MockResponse;

    beforeEach(() => {
      res = {
        statusCode: 400,
        _getData: () => ({
          success: false,
          error: 'Test error',
        }),
      } as MockResponse;
    });

    test('isBadRequest validates 400 responses', () => {
      expect(() => errorAssertions.isBadRequest(res)).not.toThrow();
    });

    test('isUnauthorized validates 401 responses', () => {
      res.statusCode = 401;
      expect(() => errorAssertions.isUnauthorized(res)).not.toThrow();
    });

    test('isForbidden validates 403 responses', () => {
      res.statusCode = 403;
      expect(() => errorAssertions.isForbidden(res)).not.toThrow();
    });

    test('isNotFound validates 404 responses', () => {
      res.statusCode = 404;
      expect(() => errorAssertions.isNotFound(res)).not.toThrow();
    });

    test('isServerError validates 500 responses', () => {
      res.statusCode = 500;
      expect(() => errorAssertions.isServerError(res)).not.toThrow();
    });
  });

  describe('createErrorHandler', () => {
    test('creates handler that throws specified error', async () => {
      const error = new Error('Test error');
      const handler = createErrorHandler(error);

      await expect(handler()).rejects.toThrow(error);
    });
  });

  describe('createErrorTests', () => {
    const mockHandler = (req: Request, res: MockResponse) => {
      res.status(200).json({ success: true });
    };

    test('creates test suite for error scenarios', async () => {
      const errorTests = createErrorTests(mockHandler);

      await expect(errorTests.testBadRequest()).resolves.not.toThrow();
      await expect(errorTests.testUnauthorized()).resolves.not.toThrow();
      await expect(errorTests.testNotFound()).resolves.not.toThrow();
      await expect(errorTests.testDatabaseError()).resolves.not.toThrow();
    });

    test('handles custom error messages', async () => {
      const errorTests = createErrorTests(mockHandler);
      const customMessage = 'Custom error message';

      await errorTests.testBadRequest(customMessage);
      await errorTests.testUnauthorized(customMessage);
      await errorTests.testNotFound(customMessage);
      await errorTests.testDatabaseError('Custom operation');
    });
  });
});
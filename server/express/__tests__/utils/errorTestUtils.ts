import { NextFunction, Request } from 'express';
import { MockResponse, createMockResponse } from './mockResponse';
import { createMockRequest } from './mockRequest';
import { AppError, BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/app-error';

interface ErrorTestResult {
  error: Error | AppError;
  req: ReturnType<typeof createMockRequest>;
  res: MockResponse;
  next: jest.Mock;
}

/**
 * Tests error handling for a route handler or middleware
 */
export async function testErrorHandling(
  handler: (req: Request, res: MockResponse, next: NextFunction) => Promise<void> | void,
  error: Error | AppError
): Promise<ErrorTestResult> {
  const req = createMockRequest();
  const res = createMockResponse();
  const next = vi.fn();

  // Create handler that will throw the specified error
  const errorHandler = async () => {
    try {
      await handler(req as Request, res, next);
    } catch (err) {
      next(err);
    }
  };

  // Execute handler and catch error
  await errorHandler();

  return { error, req, res, next };
}

/**
 * Tests bad request error handling
 */
export async function testBadRequest(
  handler: (req: Request, res: MockResponse, next: NextFunction) => Promise<void> | void,
  message = 'Bad Request'
): Promise<ErrorTestResult> {
  return testErrorHandling(handler, new BadRequestError(message));
}

/**
 * Tests unauthorized error handling
 */
export async function testUnauthorized(
  handler: (req: Request, res: MockResponse, next: NextFunction) => Promise<void> | void,
  message = 'Unauthorized'
): Promise<ErrorTestResult> {
  return testErrorHandling(handler, new UnauthorizedError(message));
}

/**
 * Tests not found error handling
 */
export async function testNotFound(
  handler: (req: Request, res: MockResponse, next: NextFunction) => Promise<void> | void,
  message = 'Not Found'
): Promise<ErrorTestResult> {
  return testErrorHandling(handler, new NotFoundError(message));
}

/**
 * Tests database error handling
 */
export async function testDatabaseError(
  handler: (req: Request, res: MockResponse, next: NextFunction) => Promise<void> | void,
  operation = 'Database operation'
): Promise<ErrorTestResult> {
  return testErrorHandling(handler, new Error(`${operation} failed`));
}

/**
 * Verifies error response matches expected status and message
 */
export function verifyErrorResponse(
  res: MockResponse,
  status: number,
  message?: string
): void {
  expect(res.statusCode).toBe(status);
  const data = res._getData();
  expect(data).toMatchObject({
    success: false,
    error: message ? expect.stringContaining(message) : expect.any(String),
  });
}

/**
 * Creates assertions for common error scenarios
 */
export const errorAssertions = {
  isBadRequest: (res: MockResponse, message?: string) => 
    verifyErrorResponse(res, 400, message),
  
  isUnauthorized: (res: MockResponse, message?: string) => 
    verifyErrorResponse(res, 401, message),
  
  isForbidden: (res: MockResponse, message?: string) => 
    verifyErrorResponse(res, 403, message),
  
  isNotFound: (res: MockResponse, message?: string) => 
    verifyErrorResponse(res, 404, message),
  
  isServerError: (res: MockResponse, message?: string) => 
    verifyErrorResponse(res, 500, message),
};

/**
 * Creates a mock handler that throws an error
 */
export function createErrorHandler(error: Error | AppError) {
  return async () => {
    throw error;
  };
}

/**
 * Creates test cases for error handling scenarios
 */
export function createErrorTests(
  handler: (req: Request, res: MockResponse, next: NextFunction) => Promise<void> | void
) {
  return {
    async testBadRequest(message?: string) {
      const { res } = await testBadRequest(handler, message);
      errorAssertions.isBadRequest(res, message);
    },

    async testUnauthorized(message?: string) {
      const { res } = await testUnauthorized(handler, message);
      errorAssertions.isUnauthorized(res, message);
    },

    async testNotFound(message?: string) {
      const { res } = await testNotFound(handler, message);
      errorAssertions.isNotFound(res, message);
    },

    async testDatabaseError(operation?: string) {
      const { res } = await testDatabaseError(handler, operation);
      errorAssertions.isServerError(res);
    },
  };
}

export default {
  testErrorHandling,
  testBadRequest,
  testUnauthorized,
  testNotFound,
  testDatabaseError,
  verifyErrorResponse,
  errorAssertions,
  createErrorHandler,
  createErrorTests,
};
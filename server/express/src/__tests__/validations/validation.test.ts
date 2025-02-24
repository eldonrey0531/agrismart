import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { z } from 'zod';
import { Request, Response } from 'express-serve-static-core';
import { NextFunction } from 'express-serve-static-core';
import {
  createValidator,
  createSchemaValidator,
  withValidation,
  withSchemaValidation
} from '../../validations';
import { ApiError } from '../../types/error';

// Test request interface
interface TestRequest extends Request {
  body: any;
  query: any;
  params: any;
}

// Mock response interface
interface MockResponse extends Partial<Response> {
  status: Mock;
  json: Mock;
}

describe('Validation Utilities', () => {
  // Test schemas
  const testSchema = z.object({
    name: z.string().min(2),
    age: z.number().min(18)
  });

  const querySchema = z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100)
  });

  // Mock request, response and next function
  let mockReq: TestRequest;
  let mockRes: MockResponse;
  let mockNext: Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    } as TestRequest;

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    } as MockResponse;

    mockNext = vi.fn();
  });

  describe('createValidator', () => {
    it('should validate valid data', async () => {
      const validator = createValidator(testSchema);
      mockReq.body = { name: 'John', age: 25 };

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject invalid data', async () => {
      const validator = createValidator(testSchema);
      mockReq.body = { name: 'J', age: 15 };

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('createSchemaValidator', () => {
    it('should validate multiple locations', async () => {
      const validator = createSchemaValidator({
        body: testSchema,
        query: querySchema
      });

      mockReq.body = { name: 'John', age: 25 };
      mockReq.query = { page: 1, limit: 10 };

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject if any validation fails', async () => {
      const validator = createSchemaValidator({
        body: testSchema,
        query: querySchema
      });

      mockReq.body = { name: 'John', age: 25 };
      mockReq.query = { page: 0, limit: 200 }; // Invalid query

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  describe('withValidation', () => {
    it('should pass validated data to handler', async () => {
      const handler = vi.fn();
      const middleware = withValidation(testSchema, 'body', handler);

      mockReq.body = { name: 'John', age: 25 };

      await middleware[0](mockReq as Request, mockRes as Response, mockNext as NextFunction);
      await middleware[1](mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { name: 'John', age: 25 }
        }),
        expect.anything(),
        expect.anything()
      );
    });

    it('should handle errors in handler', async () => {
      const error = new Error('Test error');
      const handler = vi.fn().mockRejectedValue(error);
      const middleware = withValidation(testSchema, 'body', handler);

      mockReq.body = { name: 'John', age: 25 };

      await middleware[0](mockReq as Request, mockRes as Response, mockNext as NextFunction);
      await middleware[1](mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('withSchemaValidation', () => {
    it('should pass validated data from multiple locations', async () => {
      const handler = vi.fn();
      const middleware = withSchemaValidation({
        body: testSchema,
        query: querySchema
      }, handler);

      mockReq.body = { name: 'John', age: 25 };
      mockReq.query = { page: 1, limit: 10 };

      await middleware[0](mockReq as Request, mockRes as Response, mockNext as NextFunction);
      await middleware[1](mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { name: 'John', age: 25 },
          query: { page: 1, limit: 10 }
        }),
        expect.anything(),
        expect.anything()
      );
    });

    it('should handle errors in handler', async () => {
      const error = new Error('Test error');
      const handler = vi.fn().mockRejectedValue(error);
      const middleware = withSchemaValidation({
        body: testSchema
      }, handler);

      mockReq.body = { name: 'John', age: 25 };

      await middleware[0](mockReq as Request, mockRes as Response, mockNext as NextFunction);
      await middleware[1](mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // Edge cases
  describe('Edge Cases', () => {
    it('should handle empty body', async () => {
      const validator = createValidator(testSchema);
      mockReq.body = {};

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle malformed data', async () => {
      const validator = createValidator(testSchema);
      mockReq.body = { name: 123, age: 'not a number' };

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle missing required fields', async () => {
      const validator = createValidator(testSchema);
      mockReq.body = { name: 'John' }; // missing age

      await validator(mockReq as Request, mockRes as Response, mockNext as NextFunction);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
import { Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware';
import { z } from 'zod';
import createMockResponse from '../utils/mockResponse';
import { createMockRequest } from '../utils/mockRequest';

describe('Validation Middleware', () => {
  let mockRes: any;
  let nextFn: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRes = createMockResponse();
    nextFn = vi.fn();
  });

  const testSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18),
  });

  test('passes valid data through', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 25,
    };

    const mockReq = createMockRequest({
      body: validData,
    });

    const middleware = validate(testSchema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockReq.validatedData).toEqual(validData);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('rejects invalid data with 400 status', async () => {
    const invalidData = {
      name: 'J', // too short
      email: 'not-an-email',
      age: 16, // too young
    };

    const mockReq = createMockRequest({
      body: invalidData,
    });

    const middleware = validate(testSchema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: expect.stringContaining('name'),
    });
  });

  test('combines data from multiple sources', async () => {
    const schema = z.object({
      query: z.string(),
      page: z.string(),
      id: z.string(),
    });

    const mockReq = createMockRequest({
      query: { query: 'search', page: '1' },
      params: { id: '123' },
    });

    const middleware = validate(schema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockReq.validatedData).toEqual({
      query: 'search',
      page: '1',
      id: '123',
    });
  });

  test('handles nested object validation', async () => {
    const nestedSchema = z.object({
      user: z.object({
        name: z.string(),
        address: z.object({
          street: z.string(),
          city: z.string(),
        }),
      }),
    });

    const validData = {
      user: {
        name: 'John',
        address: {
          street: 'Main St',
          city: 'New York',
        },
      },
    };

    const mockReq = createMockRequest({
      body: validData,
    });

    const middleware = validate(nestedSchema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockReq.validatedData).toEqual(validData);
  });

  test('handles array validation', async () => {
    const arraySchema = z.object({
      items: z.array(z.string()).min(1).max(3),
    });

    const validData = {
      items: ['item1', 'item2'],
    };

    const mockReq = createMockRequest({
      body: validData,
    });

    const middleware = validate(arraySchema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockReq.validatedData).toEqual(validData);
  });

  test('handles empty input gracefully', async () => {
    const mockReq = createMockRequest({});

    const middleware = validate(testSchema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: expect.any(String),
    });
  });

  test('transforms data according to schema', async () => {
    const transformSchema = z.object({
      age: z.string().transform(val => parseInt(val, 10)),
      name: z.string().transform(val => val.trim()),
    });

    const mockReq = createMockRequest({
      body: {
        age: '25',
        name: '  John Doe  ',
      },
    });

    const middleware = validate(transformSchema);
    await middleware(mockReq, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockReq.validatedData).toEqual({
      age: 25,
      name: 'John Doe',
    });
  });
});
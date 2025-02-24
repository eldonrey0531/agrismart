import { Request, Response, NextFunction } from 'express';
import { asyncHandler, errorHandler } from '../../middleware/asyncHandler';
import { AppError, BadRequestError } from '../../utils/app-error';
import createMockResponse from '../utils/mockResponse';

describe('Middleware: AsyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: any;
  let nextFn: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = createMockResponse();
    nextFn = vi.fn();
  });

  test('handles successful async operations', async () => {
    const handler = asyncHandler(async (_req, res) => {
      res.status(200).json({ success: true });
    });

    await handler(mockReq as Request, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(nextFn).not.toHaveBeenCalled();
  });

  test('catches and forwards errors to next', async () => {
    const testError = new Error('Test error');
    const handler = asyncHandler(async () => {
      throw testError;
    });

    await handler(mockReq as Request, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith(expect.any(AppError));
    expect(nextFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
        status: 500,
      })
    );
  });

  test('preserves custom error status codes', async () => {
    const customError = new BadRequestError('Invalid input');
    const handler = asyncHandler(async () => {
      throw customError;
    });

    await handler(mockReq as Request, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid input',
        status: 400,
      })
    );
  });
});

describe('Middleware: ErrorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: any;
  let nextFn: jest.MockedFunction<NextFunction>;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    mockReq = {};
    mockRes = createMockResponse();
    nextFn = vi.fn();
    originalNodeEnv = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');
  });

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
    vi.unstubAllEnvs();
  });

  test('handles AppError instances', () => {
    const error = new BadRequestError('Invalid input');
    
    errorHandler(error, mockReq as Request, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid input',
    });
  });

  test('handles unknown errors', () => {
    const error = new Error('Something went wrong');
    
    errorHandler(error, mockReq as Request, mockRes, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal Server Error',
    });
  });

  test('includes stack trace in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('Test error');
    error.stack = 'Test stack trace';
    
    errorHandler(error, mockReq as Request, mockRes, nextFn);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Internal Server Error',
        message: 'Test error',
        stack: 'Test stack trace',
      })
    );
  });

  test('excludes stack trace in production mode', () => {
    const error = new Error('Test error');
    error.stack = 'Test stack trace';
    
    errorHandler(error, mockReq as Request, mockRes, nextFn);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal Server Error',
    });
  });
});

describe('Integration: AsyncHandler with ErrorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: any;
  let nextFn: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {};
    mockRes = createMockResponse();
    nextFn = vi.fn().mockImplementation((error: Error | AppError) => {
      errorHandler(error, mockReq as Request, mockRes, nextFn);
    });
  });

  test('handles the full error flow', async () => {
    const handler = asyncHandler(async () => {
      throw new BadRequestError('Invalid data');
    });

    await handler(mockReq as Request, mockRes, nextFn);

    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid data',
    });
  });
});
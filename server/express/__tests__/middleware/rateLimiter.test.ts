import { Request, Response, NextFunction } from 'express';
import { createRateLimiter } from '../../middleware/asyncHandler';
import createMockResponse from '../utils/mockResponse';
import { createMockRequest } from '../utils/mockRequest';

describe('Rate Limiter Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: any;
  let nextFn: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = createMockRequest({
      ip: '127.0.0.1',
    });
    mockRes = createMockResponse();
    nextFn = vi.fn();

    // Reset timer mocks
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('allows requests within rate limit', () => {
    const limiter = createRateLimiter(1000, 2); // 2 requests per second

    // First request
    limiter(mockReq as Request, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'X-RateLimit-Limit': '2',
        'X-RateLimit-Remaining': '1',
      })
    );

    // Second request
    nextFn.mockClear();
    limiter(mockReq as Request, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'X-RateLimit-Limit': '2',
        'X-RateLimit-Remaining': '0',
      })
    );
  });

  test('blocks requests over rate limit', () => {
    const limiter = createRateLimiter(1000, 2); // 2 requests per second

    // Use up the rate limit
    limiter(mockReq as Request, mockRes, nextFn);
    limiter(mockReq as Request, mockRes, nextFn);

    // Third request should be blocked
    nextFn.mockClear();
    mockRes.status.mockClear();
    mockRes.json.mockClear();

    limiter(mockReq as Request, mockRes, nextFn);

    expect(nextFn).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: expect.stringContaining('Too many requests'),
    });
  });

  test('resets rate limit after window expires', () => {
    const windowMs = 1000;
    const limiter = createRateLimiter(windowMs, 2);

    // Use up the rate limit
    limiter(mockReq as Request, mockRes, nextFn);
    limiter(mockReq as Request, mockRes, nextFn);

    // Advance time past the window
    vi.advanceTimersByTime(windowMs);

    // Should be able to make requests again
    nextFn.mockClear();
    limiter(mockReq as Request, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'X-RateLimit-Remaining': '1',
      })
    );
  });

  test('tracks requests per IP address', () => {
    const limiter = createRateLimiter(1000, 2);

    // Request from first IP
    limiter(mockReq as Request, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();

    // Request from second IP
    const mockReq2 = createMockRequest({
      ip: '127.0.0.2',
    });
    nextFn.mockClear();
    limiter(mockReq2 as Request, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'X-RateLimit-Remaining': '1',
      })
    );
  });

  test('handles missing IP address', () => {
    const limiter = createRateLimiter(1000, 2);
    const mockReqNoIp = createMockRequest({});

    limiter(mockReqNoIp as Request, mockRes, nextFn);
    expect(nextFn).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'X-RateLimit-Remaining': '1',
      })
    );
  });

  test('includes correct headers in rate limit response', () => {
    const limiter = createRateLimiter(1000, 1);

    // Use up the rate limit
    limiter(mockReq as Request, mockRes, nextFn);

    // Trigger rate limit
    nextFn.mockClear();
    mockRes.set.mockClear();
    limiter(mockReq as Request, mockRes, nextFn);

    expect(mockRes.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'X-RateLimit-Reset': expect.any(String),
        'X-RateLimit-Limit': '1',
        'X-RateLimit-Remaining': '0',
      })
    );
  });
});
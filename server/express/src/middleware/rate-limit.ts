import { Request, Response } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { ApiError } from '../types/error';
import { RateLimitError } from '../types/api.types';
import { config } from '../config';

// Extend Express Request type to include required properties
type ExtendedRequest = Request & {
  headers: {
    'x-forwarded-for'?: string | string[];
  };
  socket?: {
    remoteAddress?: string;
  };
};

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later'
};

/**
 * Get client IP from request
 */
const getClientIp = (req: ExtendedRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

/**
 * Create rate limiter middleware with custom options
 */
export const createRateLimiter = (options: RateLimitOptions = {}): RateLimitRequestHandler => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const errorResponse: RateLimitError = {
    success: false,
    error: opts.message,
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429
  };

  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    message: JSON.stringify(errorResponse),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(opts.message, 'RATE_LIMIT_EXCEEDED', 429));
    },
    skip: () => config.ENV.NODE_ENV === 'test',
    statusCode: 429,
    keyGenerator: (req) => getClientIp(req as ExtendedRequest)
  });
};

/**
 * Authentication rate limiters
 */
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again later'
});

export const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations
  message: 'Too many registration attempts, please try again later'
});

export const emailVerificationLimiter = createRateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 verification attempts
  message: 'Too many verification attempts, please try again later'
});

export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts
  message: 'Too many password reset attempts, please try again later'
});

/**
 * API rate limiters
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded, please try again later'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Upload limit exceeded, please try again later'
});

export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Search rate limit exceeded, please try again later'
});
import { Request, Response, NextFunction } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { config } from '../config/config';
import { RateLimitError } from '../utils/errors';

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}

// Base rate limiter options
const defaultOptions = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(new RateLimitError());
  },
  skip: () => process.env.NODE_ENV === 'test',
};

// Authentication rate limiter (login, register, password reset)
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
});

// Email verification rate limiter
export const emailRateLimiter: RateLimitRequestHandler = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 emails per hour
  message: 'Too many email requests, please try again later',
});

// API rate limiter for general requests
export const apiRateLimiter: RateLimitRequestHandler = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});

// Specific endpoint rate limiter factory
export const createEndpointLimiter = (
  windowMs: number,
  maxRequests: number,
  options: Partial<typeof defaultOptions> = {}
): RateLimitRequestHandler => {
  return rateLimit({
    ...defaultOptions,
    ...options,
    windowMs,
    max: maxRequests,
  });
};

// Helper to get remaining requests
export const getRateLimitInfo = (req: Request): RateLimitInfo | null => {
  const rateLimitInfo = req.rateLimit && {
    limit: req.rateLimit.limit,
    current: req.rateLimit.current,
    remaining: req.rateLimit.remaining,
    resetTime: new Date(Date.now() + req.rateLimit.windowMs),
  };
  
  return rateLimitInfo || null;
};

// Extended Request type to include rate limit info
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        windowMs: number;
      };
    }
  }
}

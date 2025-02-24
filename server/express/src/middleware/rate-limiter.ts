import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Create rate limiter middleware
 */
export const rateLimiter = ({
  windowMs = config.RATE_LIMIT.WINDOW_MS,
  max = config.RATE_LIMIT.MAX_REQUESTS,
  message = 'Too many requests, please try again later'
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        status: 429
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Auth rate limiter middleware
 * More strict limits for authentication endpoints
 */
export const authLimiter = rateLimiter({
  windowMs: config.RATE_LIMIT.AUTH_WINDOW_MS,
  max: config.RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: 'Too many login attempts, please try again later'
});

/**
 * API rate limiter middleware
 * General limits for API endpoints
 */
export const apiLimiter = rateLimiter();
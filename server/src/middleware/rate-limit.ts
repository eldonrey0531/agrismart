import { Request, Response, NextFunction } from 'express';
import { redis } from '../lib/redis';
import { log } from '../utils/logger';
import { throwError } from '../lib/errors';
import { appConfig } from '../config/app.config';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

const defaultConfig: RateLimitConfig = {
  windowMs: appConfig.security.rateLimitWindow,
  max: appConfig.security.rateLimitMax,
  message: 'Too many requests, please try again later',
  statusCode: 429,
  keyGenerator: (req: Request) => {
    return `rate-limit:${req.ip}:${req.path}`;
  },
  skip: (req: Request) => false
};

export const createRateLimiter = (options: Partial<RateLimitConfig> = {}) => {
  const config = { ...defaultConfig, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    if (config.skip(req)) {
      return next();
    }

    const key = config.keyGenerator(req);

    try {
      const requests = await redis.incr(key);

      // Set expiry on first request
      if (requests === 1) {
        await redis.expire(key, Math.floor(config.windowMs / 1000));
      }

      // Set rate limit headers
      const ttl = await redis.ttl(key);
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - requests));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + (ttl * 1000)).toISOString());

      if (requests > config.max) {
        log.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          requests,
          limit: config.max
        });

        throwError.custom(
          config.statusCode!,
          config.message!,
          'RATE_LIMIT_EXCEEDED',
          {
            retryAfter: ttl,
            limit: config.max,
            remaining: 0
          }
        );
      }

      next();
    } catch (error) {
      log.error('Rate limit error:', error);
      next(error);
    }
  };
};

// Different rate limit configurations
export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30
});

export const mediumRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100
});

export const lenientRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250
});

// Rate limiter for authentication routes
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
  keyGenerator: (req: Request) => `auth-limit:${req.ip}`
});

// Rate limiter for API endpoints
export const rateLimiter = createRateLimiter({
  skip: (req: Request) => {
    // Skip health check endpoint
    if (req.path === '/health') return true;

    // Skip in development
    if (process.env.NODE_ENV === 'development') return true;

    return false;
  }
});

// Rate limiter for file uploads
export const uploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Too many file uploads, please try again later',
  keyGenerator: (req: Request) => `upload-limit:${req.ip}`
});

// Rate limiter for search endpoints
export const searchRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many search requests, please try again later',
  keyGenerator: (req: Request) => `search-limit:${req.ip}`
});
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';

interface RateLimitConfig {
  windowMs?: number;      // Time window in milliseconds
  max?: number;          // Max requests per window
  message?: string;      // Error message
  statusCode?: number;   // Error status code
}

export const createRateLimit = (config: RateLimitConfig = {}) => {
  const limiter = rateLimit({
    windowMs: config.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    max: config.max || 100,                      // Default: 100 requests per window
    message: config.message || 'Too many requests, please try again later',
    statusCode: config.statusCode || 429,
    standardHeaders: true,                       // Return rate limit info in headers
    legacyHeaders: false,                        // Disable the `X-RateLimit-*` headers
  });

  // Wrapper for Next.js API routes
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(next());
      });
    });
  };
};

// Preset configurations
export const defaultLimiter = createRateLimit();

export const strictLimiter = createRateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  max: 50                    // 50 requests per window
});

export const authLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                   // 5 login attempts per hour
  message: 'Too many login attempts, please try again later'
});

export default createRateLimit;
import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';

interface CacheOptions {
  ttl?: number;
  prefix?: string;
  exclude?: (req: Request) => boolean;
}

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string | number | string[]>;
  data: any;
}

const DEFAULT_TTL = 300; // 5 minutes
const DEFAULT_PREFIX = 'cache:';

export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = DEFAULT_TTL,
    prefix = DEFAULT_PREFIX,
    exclude = () => false
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache if condition is met
    if (exclude(req)) {
      return next();
    }

    // Generate cache key from request
    const key = generateCacheKey(prefix, req);

    try {
      // Try to get from cache
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        const response: CachedResponse = JSON.parse(cachedResponse);
        
        // Restore headers
        Object.entries(response.headers).forEach(([name, value]) => {
          res.setHeader(name, value);
        });

        return res.status(response.statusCode).json(response.data);
      }

      // Store original send function
      const originalSend = res.json;

      // Override send to cache response
      res.json = function (body: any) {
        const responseData: CachedResponse = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string | number | string[]>,
          data: body
        };

        // Cache response
        redis.setex(key, ttl, JSON.stringify(responseData))
          .catch(err => console.error('Cache error:', err));

        // Call original send
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      // If cache fails, continue without caching
      console.error('Cache error:', error);
      next();
    }
  };
};

/**
 * Generate cache key from request
 */
function generateCacheKey(prefix: string, req: Request): string {
  const key = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method === 'GET' ? undefined : req.body
  };

  return `${prefix}${JSON.stringify(key)}`;
}

/**
 * Clear cache by prefix
 */
export async function clearCache(prefix: string = DEFAULT_PREFIX): Promise<void> {
  const keys = await redis.scan(`${prefix}*`);
  if (keys.length) {
    await redis.del(...keys);
  }
}
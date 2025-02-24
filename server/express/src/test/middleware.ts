import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware types
 */
export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Convert sync middleware to async
 */
export function toAsync(middleware: Middleware): AsyncMiddleware {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.resolve(middleware(req, res, next));
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Combine multiple middleware into one
 */
export function combineMiddleware(...middlewares: Middleware[]): AsyncMiddleware {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const middleware of middlewares) {
        await new Promise<void>((resolve, reject) => {
          middleware(req, res, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
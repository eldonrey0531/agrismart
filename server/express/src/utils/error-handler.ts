import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export function catchErrors(fn: AsyncRequestHandler) {
  return function(req: Request, res: Response, next: NextFunction) {
    return fn(req, res, next).catch(next);
  };
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  if (statusCode === 500) {
    logger.error('Server Error:', err);
  } else {
    logger.debug('Client Error:', {
      statusCode,
      message,
      errors,
      path: req.path,
      method: req.method
    });
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(errors.length > 0 && { errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}
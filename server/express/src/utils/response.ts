import { Response } from 'express';

export function success(res: Response, data: any = {}, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  });
}

export function error(res: Response, error: Error, statusCode: number = 500) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    timestamp: new Date().toISOString()
  });
}

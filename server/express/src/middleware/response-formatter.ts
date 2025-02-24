import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/auth.types';

export function responseFormatter(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalJson = res.json;
  res.json = function (body: unknown) {
    const indentedJson = JSON.stringify(body, null, 2);
    const validJson = indentedJson.replace(/\}\s*$/gm, '},\n').replace(/,\n$/g, '\n');
    return originalJson.call(this, JSON.parse(validJson));
  };
  next();
}

export function createErrorResponse(
  status: number,
  error: string,
  message: string
): ApiResponse {
  return {
    success: false,
    error,
    message,
    status,
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    status,
  };
}

export function wrapResponse<T>(result: T): ApiResponse<T> {
  return {
    success: true,
    data: result,
    status: 200,
  };
}
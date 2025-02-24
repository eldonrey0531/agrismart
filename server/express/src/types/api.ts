import { Response } from 'express';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: any;
  status: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string
): void => {
  res.json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  error: string,
  message: string,
  details?: any,
  status: number = 500
): void => {
  res.status(status).json({
    success: false,
    error,
    message,
    details,
    status,
  });
};
import { Response } from 'express';

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  status: number;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  status: number;
}

export function sendErrorResponse(
  res: Response,
  status: number,
  error: string,
  message: string
): Response {
  const response: ErrorResponse = {
    success: false,
    error,
    message,
    status
  };

  return res.status(status).json(response);
}

export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  message?: string,
  status = 200
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
    status
  };

  return res.status(status).json(response);
}
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedUser } from './user';

// Basic request handler type
export type RequestHandler<T = void> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Authenticated request handler type
export type AuthenticatedRequestHandler<T = void> = (
  req: Request & { user: AuthenticatedUser },
  res: Response,
  next: NextFunction
) => Promise<void>;

// Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth responses
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

// Admin responses
export interface AdminInfoResponse {
  message: string;
  status: string;
  version: string;
  features: {
    userManagement: boolean;
    systemMonitoring: boolean;
    contentModeration: boolean;
  };
  endpoints: {
    overview: string;
    stats: string;
    users: string;
    system: string;
  };
  documentation: string;
}

export interface AdminOverviewResponse {
  message: string;
  stats: {
    totalUsers: number;
    pendingModeration: number;
    activeReports: number;
    systemHealth: string;
  };
}

export interface AdminStatsResponse {
  message: string;
  stats: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    totalTransactions: number;
  };
}

// Error codes
export enum ErrorCode {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED'
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

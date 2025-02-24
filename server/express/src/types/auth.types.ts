import { Request } from 'express-serve-static-core';
import { Role, Status } from './enums';

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
}

// Full user interface with dates
export interface AuthUser extends BaseUser {
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Token interfaces
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// Request interfaces
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms?: boolean; // Optional for testing
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Response interfaces
export interface LoginResponse {
  success: boolean;
  data: {
    user: AuthUser;
  } & TokenResponse;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: AuthUser;
  message?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Extended Request Types
export interface AuthenticatedRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = {}
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
}

export interface LoginRequestWithBody extends AuthenticatedRequest<{}, LoginResponse, LoginRequest> {}

export interface RegisterRequestWithBody extends AuthenticatedRequest<{}, AuthResponse, RegisterRequest> {}

export interface ChangePasswordRequestWithBody extends AuthenticatedRequest<{}, AuthResponse, ChangePasswordRequest> {}

export interface TokenVerificationRequest extends AuthenticatedRequest<{
  token: string;
}, AuthResponse> {}

// Cookie Types
export interface AuthCookies {
  accessToken?: string;
  refreshToken?: string;
}

export interface RequestWithCookies<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = {}
> extends AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery> {
  cookies: AuthCookies;
}

// Auth Options
export interface AuthOptions {
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
    maxAge: number;
  };
}

// User document mapping
export interface UserToAuthUser {
  (user: Record<string, any>): AuthUser;
}
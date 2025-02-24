import { Role, Status } from './enums';

/**
 * Authenticated user structure
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request body
 */
export interface RegisterRequest extends LoginRequest {
  name: string;
}

/**
 * Authentication response structure
 */
export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: AuthenticatedUser;
  };
}

/**
 * JWT token payload structure
 */
export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
  iat?: number;
  exp?: number;
}

/**
 * Token verification response
 */
export interface TokenVerificationResponse {
  success: boolean;
  message?: string;
  user?: AuthenticatedUser;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN'
}
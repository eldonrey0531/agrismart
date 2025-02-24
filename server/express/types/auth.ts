import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'seller' | 'admin';
  status: 'pending' | 'active' | 'suspended';
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: AuthUser['role'];
}

export interface VerificationStatus {
  attemptsLeft: number;
  cooldownSeconds: number;
  canResend: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface VerificationResponse extends AuthResponse {
  status: VerificationStatus;
}

// Express request with authenticated user
export interface RequestWithAuth extends Request {
  user: AuthUser;
}
import { AuthenticationError } from '../utils/errors';
import { authService } from '../services/AuthService';
import { emailVerificationService } from '../services/EmailVerificationService';
import { RequestHandler, createSuccessResponse } from '../types/express';
import { AuthUser, toAuthUser } from '../types/user';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Login handler
export const login: RequestHandler<{}, AuthResponse, LoginRequest> = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.authenticate(email, password);
  
  res.json(createSuccessResponse({
    token: result.token,
    user: toAuthUser(result.user)
  }));
};

// Registration handler
export const register: RequestHandler<{}, AuthResponse> = async (req, res) => {
  const result = await authService.register(req.body);
  
  res.status(201).json(createSuccessResponse({
    token: result.token,
    user: toAuthUser(result.user)
  }, 'Registration successful. Please check your email for verification.'));
};

// Email verification handler
export const verifyEmail: RequestHandler<{}, { user: AuthUser }> = async (req, res) => {
  const { token } = req.body;
  
  const userDoc = await emailVerificationService.verifyEmail(token);
  
  res.json(createSuccessResponse({
    user: toAuthUser(userDoc)
  }, 'Email verified successfully'));
};

// Resend verification email handler
export const resendVerificationEmail: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AuthenticationError('User not authenticated');
  }

  await emailVerificationService.resendVerificationEmail(req.user.id);
  
  res.json(createSuccessResponse(
    undefined,
    'Verification email sent'
  ));
};

// Password reset request handler
export const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email } = req.body;
  await authService.initiatePasswordReset(email);
  
  res.json(createSuccessResponse(
    undefined,
    'If an account exists with that email, a password reset link will be sent.'
  ));
};

// Password reset handler
export const resetPassword: RequestHandler<{}, AuthResponse> = async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  
  res.json(createSuccessResponse({
    token: result.token,
    user: toAuthUser(result.user)
  }, 'Password reset successfully'));
};

// Password change handler
export const changePassword: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AuthenticationError('User not authenticated');
  }

  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  
  res.json(createSuccessResponse(
    undefined,
    'Password changed successfully'
  ));
};

// Email change handler
export const changeEmail: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AuthenticationError('User not authenticated');
  }

  const { email, password } = req.body;
  await authService.changeEmail(req.user.id, email, password);
  
  res.json(createSuccessResponse(
    undefined,
    'Email change initiated. Please verify your new email.'
  ));
};

// Get current user handler
export const getCurrentUser: RequestHandler<{}, { user: AuthUser }> = async (req, res) => {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  res.json(createSuccessResponse({
    user: req.user
  }));
};

// Logout handler
export const logout: RequestHandler = async (_req, res) => {
  res.json(createSuccessResponse(
    undefined,
    'Logged out successfully'
  ));
};

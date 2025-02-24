import { Request } from 'express';
import { Response as ExpressResponse, NextFunction } from 'express-serve-static-core';
import { AuthService } from '../services/auth.service';
import { 
  LoginRequestWithBody,
  RegisterRequestWithBody,
  ChangePasswordRequestWithBody,
  TokenVerificationRequest,
  RequestWithCookies,
  AuthenticatedRequest,
  LoginResponse,
  AuthResponse
} from '../types/auth.types';
import { ApiError } from '../types/error';
import { config } from '../config';

type Response<T> = ExpressResponse<T>;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

export class AuthController {
  /**
   * Register new user
   */
  static async register(
    req: RegisterRequestWithBody,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: 'Registration successful. Please verify your email.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(
    req: LoginRequestWithBody,
    res: Response<LoginResponse>,
    next: NextFunction
  ) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);

      // Set auth cookies
      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: { user, accessToken, refreshToken },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(
    req: TokenVerificationRequest,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      const user = await AuthService.verifyEmail(req.params.token);
      res.json({
        success: true,
        data: user,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request email verification resend
   */
  static async resendVerification(
    req: Request<{}, {}, { email: string }>,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      await AuthService.resendVerification(req.body.email);
      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(
    req: Request<{}, {}, { email: string }>,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(
    req: Request<{ token: string }, {}, { password: string }>,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      await AuthService.resetPassword(req.params.token, req.body.password);
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    req: ChangePasswordRequestWithBody,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      await AuthService.changePassword(req.user.id, req.body);
      
      // Revoke all sessions for security
      await AuthService.revokeAllTokens(req.user.id);
      
      // Clear auth cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

      res.json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      const user = await AuthService.getProfile(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(
    req: RequestWithCookies,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      const refreshToken = req.cookies.refreshToken;
      await AuthService.logout(req.user.id, refreshToken);

      // Clear auth cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke all tokens
   */
  static async revokeAllTokens(
    req: AuthenticatedRequest,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      if (!req.user?.id) {
        throw new ApiError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      await AuthService.revokeAllTokens(req.user.id);

      // Clear auth cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

      res.json({
        success: true,
        message: 'All sessions revoked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(
    req: RequestWithCookies,
    res: Response<LoginResponse>,
    next: NextFunction
  ) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new ApiError('Refresh token required', 'UNAUTHORIZED', 401);
      }

      const { user, accessToken, newRefreshToken } = await AuthService.refreshAccessToken(refreshToken);

      // Update cookies
      res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...COOKIE_OPTIONS,
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: { 
          user,
          accessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
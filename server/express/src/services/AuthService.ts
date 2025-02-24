import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { emailService } from './EmailService';
import { emailVerificationService } from './EmailVerificationService';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { UserDocument, AuthUser, toAuthUser } from '../types/user';

interface AuthResult {
  user: UserDocument;
  token: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private generateAuthToken(user: UserDocument): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        isVerified: user.isVerified,
        sessionVersion: user.sessionVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m' }
    );
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const user = await User.findOne({ email, status: { $ne: 'deleted' } });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    return {
      user,
      token: this.generateAuthToken(user),
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    mobile: string;
    notificationPreferences?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  }): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const user = await User.create(data);
    await emailVerificationService.sendVerificationEmail(user);

    return {
      user,
      token: this.generateAuthToken(user),
    };
  }

  async initiatePasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    user.lastPasswordResetRequest = new Date();
    await user.save();

    await emailService.sendPasswordResetEmail({
      userId: user.id,
      email: user.email,
      name: user.name,
      token,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordReset = new Date();
    user.sessionVersion += 1; // Invalidate all existing sessions
    await user.save();

    await emailService.sendPasswordChangedNotification({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user,
      token: this.generateAuthToken(user),
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    user.password = newPassword;
    user.lastPasswordReset = new Date();
    user.sessionVersion += 1; // Invalidate all existing sessions
    await user.save();

    await emailService.sendPasswordChangedNotification({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  }

  async changeEmail(
    userId: string,
    newEmail: string,
    password: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthenticationError('Password is incorrect');
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      throw new ValidationError('Email already in use');
    }

    user.email = newEmail;
    user.isVerified = false;
    await user.save();

    await emailVerificationService.sendVerificationEmail(user);
  }
}

export const authService = AuthService.getInstance();
export default authService;
import { User } from '../models/User';
import { emailService } from './EmailService';
import { config } from '../config/config';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { UserDocument, toAuthUser, AuthUser, UserStatus } from '../types/user';
import crypto from 'crypto';

class EmailVerificationService {
  private static instance: EmailVerificationService;

  private constructor() {}

  public static getInstance(): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService();
    }
    return EmailVerificationService.instance;
  }

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(user: UserDocument): Promise<void> {
    const verificationToken = this.generateVerificationToken();
    user.verificationToken = verificationToken;
    user.lastVerificationEmailSent = new Date();
    await user.save();

    await emailService.sendVerificationEmail({
      userId: user.id,
      email: user.email,
      name: user.name,
      token: verificationToken,
    });
  }

  async verifyEmail(token: string): Promise<UserDocument> {
    const user = await User.findOne({
      verificationToken: token,
      isVerified: false,
      status: { $ne: UserStatus.DELETED },
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired verification token');
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (
      !user.lastVerificationEmailSent ||
      user.lastVerificationEmailSent < twentyFourHoursAgo
    ) {
      throw new AuthenticationError('Verification token has expired');
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    user.verificationToken = undefined;
    user.status = UserStatus.ACTIVE;
    user.statusUpdatedAt = new Date();
    await user.save();

    return user;
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await User.findOne({
      _id: userId,
      status: { $ne: UserStatus.DELETED },
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.isVerified) {
      throw new ValidationError('Email is already verified');
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (
      user.lastVerificationEmailSent &&
      user.lastVerificationEmailSent > oneHourAgo
    ) {
      const minutesLeft = Math.ceil(
        (user.lastVerificationEmailSent.getTime() + 60 * 60 * 1000 - Date.now()) /
          (60 * 1000)
      );
      throw new ValidationError(
        `Please wait ${minutesLeft} minutes before requesting another verification email`
      );
    }

    await this.sendVerificationEmail(user);
  }

  async checkVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    canResend: boolean;
    timeUntilResend?: number;
    status: UserStatus;
  }> {
    const user = await User.findOne({
      _id: userId,
      status: { $ne: UserStatus.DELETED },
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const canResend = !user.lastVerificationEmailSent || 
                     user.lastVerificationEmailSent <= oneHourAgo;

    let timeUntilResend: number | undefined;
    if (!canResend && user.lastVerificationEmailSent) {
      timeUntilResend = Math.ceil(
        (user.lastVerificationEmailSent.getTime() + 60 * 60 * 1000 - Date.now()) /
          1000
      );
    }

    return {
      isVerified: user.isVerified,
      canResend,
      timeUntilResend,
      status: user.status,
    };
  }
}

export const emailVerificationService = EmailVerificationService.getInstance();
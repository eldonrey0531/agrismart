import nodemailer from 'nodemailer';
import { UserDocument } from '../types';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendVerificationEmail(user: UserDocument): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  user.verificationToken = token;
  user.lastVerificationEmailSent = new Date();
  await user.save();

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"AgriSmart" <${process.env.SMTP_FROM}>`,
    to: user.email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to AgriSmart!</h1>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationLink}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
        Verify Email
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    `
  });

  logger.debug(`Verification email sent to ${user.email}`);
}

export async function sendPasswordResetEmail(user: UserDocument): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  user.lastPasswordResetRequest = new Date();
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"AgriSmart" <${process.env.SMTP_FROM}>`,
    to: user.email,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetLink}" style="padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  });

  logger.debug(`Password reset email sent to ${user.email}`);
}
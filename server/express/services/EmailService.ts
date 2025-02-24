import nodemailer from 'nodemailer';
import type { Transporter, TransportOptions } from 'nodemailer';
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';
import type { Options as MailOptions } from 'nodemailer/lib/mailer';
import { validateEnv } from '@/env';

const env = validateEnv();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: Transporter;

  private constructor() {
    // Assert that required environment variables are defined
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
      throw new Error('Missing required SMTP configuration');
    }

    const transportConfig: SMTPOptions = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      secure: env.SMTP_PORT === 465,
      logger: env.NODE_ENV === 'development',
      debug: env.NODE_ENV === 'development',
    } as SMTPOptions;

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions: MailOptions = {
      from: {
        name: 'Your App Name',
        address: env.SMTP_FROM,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.stripHtml(options.html),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(params: {
    userId: string;
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${params.token}`;
    
    await this.sendEmail({
      to: params.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${params.name},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  async sendPasswordChangedNotification(params: {
    userId: string;
    email: string;
    name: string;
  }): Promise<void> {
    await this.sendEmail({
      to: params.email,
      subject: 'Password Changed',
      html: `
        <h1>Password Changed</h1>
        <p>Hi ${params.name},</p>
        <p>Your password was recently changed.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `,
    });
  }

  async sendVerificationEmail(params: {
    userId: string;
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${params.token}`;
    
    await this.sendEmail({
      to: params.email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Hi ${params.name},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    });
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '');
  }

  /**
   * Test SMTP connection by sending a test email
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.sendEmail({
        to: env.SMTP_FROM,
        subject: 'SMTP Connection Test',
        html: '<p>This is a test email to verify SMTP connection.</p>',
      });
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();
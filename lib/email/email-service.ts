import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email';
import { verificationEmail, passwordResetEmail, passwordChangedEmail } from './templates';

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

class EmailService {
  private static instance: EmailService;
  private readonly appUrl: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly transporter: nodemailer.Transporter;

  private constructor() {
    // Check required environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Gmail credentials not configured');
      }
    }

    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.fromEmail = process.env.EMAIL_FROM || emailConfig.from.email;
    this.fromName = process.env.EMAIL_FROM_NAME || emailConfig.from.name;

    // Create Gmail SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      }
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async send(options: SendMailOptions): Promise<void> {
    if (process.env.NODE_ENV === 'development' && (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)) {
      console.log('=== Email Service (Development Mode) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Text:', options.text);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error('[EMAIL_SERVICE_ERROR]', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to,
        subject: options.subject,
      });
      
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(params: { 
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${params.token}`;
    const html = verificationEmail(params.name, verificationUrl);
    
    await this.send({
      to: params.email,
      subject: emailConfig.templates.verification.subject,
      text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
      html,
    });
  }

  async sendPasswordResetEmail(params: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password/${params.token}`;
    const html = passwordResetEmail(params.name, resetUrl);

    await this.send({
      to: params.email,
      subject: emailConfig.templates.passwordReset.subject,
      text: `Hi ${params.name},\n\nYou requested to reset your password. Click the following link to set a new password: ${resetUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this, you can safely ignore this email.`,
      html,
    });
  }

  async sendPasswordChangedNotification(params: {
    email: string;
    name: string;
  }): Promise<void> {
    const html = passwordChangedEmail(params.name);

    await this.send({
      to: params.email,
      subject: emailConfig.templates.passwordChanged.subject,
      text: `Hi ${params.name},\n\nYour password has been changed successfully.\n\nIf you didn't make this change, please contact support immediately.`,
      html,
    });
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      // Try sending a test email
      const testResult = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: process.env.GMAIL_USER || '',
        subject: "Email Service Test",
        text: "This is a test email to verify the email service configuration.",
      });
      
      return !!testResult?.messageId;
    } catch (error) {
      console.error('[EMAIL_SERVICE_TEST_ERROR]', error);
      return false;
    }
  }
}

export const emailService = EmailService.getInstance();
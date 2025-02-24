import nodemailer, { Transporter } from 'nodemailer';
import { appConfig } from '../config/app.config';
import { log } from '../utils/logger';
import { throwError } from './errors';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

class MailerService {
  private transporter: Transporter;
  private readonly defaultFrom: string;

  constructor() {
    this.defaultFrom = appConfig.email.from;
    this.transporter = nodemailer.createTransport({
      host: appConfig.email.smtp.host,
      port: appConfig.email.smtp.port,
      secure: appConfig.email.smtp.secure,
      auth: {
        user: appConfig.email.smtp.auth.user,
        pass: appConfig.email.smtp.auth.pass
      }
    });

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      log.info('SMTP connection established successfully');
    } catch (error) {
      log.error('SMTP connection failed:', error);
      throwError.externalService('SMTP', 'Failed to establish connection');
    }
  }

  public async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.defaultFrom,
        ...options
      });
      log.info('Email sent successfully', { to: options.to, subject: options.subject });
    } catch (error) {
      log.error('Failed to send email:', { error, options });
      throwError.externalService('SMTP', 'Failed to send email');
    }
  }

  // Email template methods
  public async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template = this.getWelcomeTemplate(name);
    await this.sendEmail({
      to,
      ...template
    });
  }

  public async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const template = this.getPasswordResetTemplate(resetToken);
    await this.sendEmail({
      to,
      ...template
    });
  }

  public async sendVerificationEmail(to: string, verificationToken: string): Promise<void> {
    const template = this.getVerificationTemplate(verificationToken);
    await this.sendEmail({
      to,
      ...template
    });
  }

  public async sendOrderConfirmationEmail(to: string, orderDetails: any): Promise<void> {
    const template = this.getOrderConfirmationTemplate(orderDetails);
    await this.sendEmail({
      to,
      ...template
    });
  }

  // Template generators
  private getWelcomeTemplate(name: string): EmailTemplate {
    return {
      subject: 'Welcome to AgriSmart!',
      text: `Welcome ${name}! Thank you for joining AgriSmart.`,
      html: `
        <h1>Welcome to AgriSmart!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Start exploring our marketplace and connect with farmers and buyers.</p>
      `
    };
  }

  private getPasswordResetTemplate(token: string): EmailTemplate {
    const resetUrl = `${appConfig.clientUrl}/reset-password?token=${token}`;
    return {
      subject: 'Password Reset Request',
      text: `Click here to reset your password: ${resetUrl}`,
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
  }

  private getVerificationTemplate(token: string): EmailTemplate {
    const verifyUrl = `${appConfig.clientUrl}/verify-email?token=${token}`;
    return {
      subject: 'Verify Your Email',
      text: `Click here to verify your email: ${verifyUrl}`,
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering! Please verify your email address.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyUrl}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      `
    };
  }

  private getOrderConfirmationTemplate(order: any): EmailTemplate {
    return {
      subject: `Order Confirmation #${order.id}`,
      text: `Thank you for your order! Your order #${order.id} has been confirmed.`,
      html: `
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <h2>Order Details</h2>
        <p>Order ID: ${order.id}</p>
        <p>Total Amount: $${order.totalAmount}</p>
        <!-- Add more order details here -->
      `
    };
  }

  // Cleanup
  public async close(): Promise<void> {
    this.transporter.close();
    log.info('SMTP connection closed');
  }
}

// Export singleton instance
export const mailer = new MailerService();
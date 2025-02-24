import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// Types
export interface EmailTemplateData {
  name: string
  appName: string
  [key: string]: any
}

export interface EmailTemplate {
  html: string
  text: string
}

export type EmailTemplateType = 'verification' | 'reset' | 'welcome' | '2fa' | 'recovery'

export interface VerificationTemplateData extends EmailTemplateData {
  verificationUrl: string
  expiryHours: number
}

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Modify EmailConfig to use string for from field
export interface EmailConfig {
  from: string // Format: "Name <email@example.com>"
  smtp: SmtpConfig
}

// Styles remain the same...
const styles = {
  container: `
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
  `,
  header: `
    text-align: center;
    padding: 20px 0;
    background-color: #f8f9fa;
    border-radius: 8px 8px 0 0;
  `,
  content: `
    padding: 30px 20px;
    background-color: #ffffff;
  `,
  button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    margin: 20px 0;
  `,
  heading: `
    color: #2d3748;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 20px 0;
  `,
  paragraph: `
    color: #4a5568;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 16px 0;
  `,
  footer: `
    text-align: center;
    padding: 20px;
    color: #718096;
    font-size: 14px;
    border-top: 1px solid #e2e8f0;
  `
}

// Template wrapper
function wrapTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
      </head>
      <body style="margin:0;padding:0;word-spacing:normal;background-color:#f8f9fa;">
        <div role="article" aria-roledescription="email" lang="en">
          ${content}
        </div>
      </body>
    </html>
  `
}

// Create button helper
function createButton(text: string, url: string): string {
  return `
    <div style="text-align:center;margin:30px 0;">
      <a href="${url}" target="_blank" style="${styles.button}">
        ${text}
      </a>
    </div>
  `
}

// Verification email template
function createVerificationEmail(data: VerificationTemplateData): EmailTemplate {
  const html = wrapTemplate(`
    <div style="${styles.container}">
      <div style="${styles.header}">
        <h1 style="${styles.heading}">${data.appName}</h1>
      </div>
      
      <div style="${styles.content}">
        <h2 style="${styles.heading}">Verify Your Email</h2>
        <p style="${styles.paragraph}">Hello ${data.name},</p>
        <p style="${styles.paragraph}">
          Please verify your email address by clicking the button below:
        </p>
        
        ${createButton('Verify Email', data.verificationUrl)}
        
        <p style="${styles.paragraph}">
          This link will expire in ${data.expiryHours} hours.
        </p>
        
        <p style="${styles.paragraph}">
          If you didn't request this verification, you can safely ignore this email.
        </p>
      </div>
      
      <div style="${styles.footer}">
        <p>This is an automated message from ${data.appName}. Please do not reply.</p>
      </div>
    </div>
  `)

  const text = `
    Hello ${data.name},

    Please verify your email address by clicking the link below:

    ${data.verificationUrl}

    This link will expire in ${data.expiryHours} hours.

    If you didn't request this verification, you can safely ignore this email.

    This is an automated message from ${data.appName}. Please do not reply.
  `.trim()

  return { html, text }
}

// Template map
const templates: Record<EmailTemplateType, Function> = {
  verification: createVerificationEmail,
  reset: () => ({ html: '', text: '' }), // TODO: Implement
  welcome: () => ({ html: '', text: '' }), // TODO: Implement
  '2fa': () => ({ html: '', text: '' }), // TODO: Implement
  recovery: () => ({ html: '', text: '' }) // TODO: Implement
}

// Generate email template
export function generateEmailTemplate<T extends EmailTemplateType>(
  type: T,
  data: EmailTemplateData
): EmailTemplate {
  const template = templates[type]
  if (!template) {
    throw new Error(`Template "${type}" not found`)
  }
  return template(data)
}

// Email service class
export class EmailService {
  private transporter: Transporter
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
    this.transporter = nodemailer.createTransport(config.smtp)
  }

  async sendEmail(
    to: string,
    subject: string,
    template: EmailTemplate
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject,
        html: template.html,
        text: template.text
      })
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const address = this.config.from.match(/<(.+)>/)?.[1] || this.config.from
      await this.transporter.sendMail({
        from: this.config.from,
        to: address,
        subject: 'SMTP Test',
        text: 'SMTP connection test'
      })
      return true
    } catch (error) {
      console.error('SMTP Connection Error:', error)
      return false
    }
  }
}

// Default email configuration
const defaultConfig: EmailConfig = {
  from: `${process.env.EMAIL_FROM_NAME || 'Your App'} <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  }
}

// Export singleton instance
export const emailService = new EmailService(defaultConfig)
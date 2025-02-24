/**
 * Base template data interface
 */
export interface EmailTemplateData {
  name: string
  appName: string
  [key: string]: any
}

/**
 * Email template result interface
 */
export interface EmailTemplate {
  html: string
  text: string
}

/**
 * Email template types
 */
export type EmailTemplateType = 'verification' | 'reset' | 'welcome' | '2fa' | 'recovery'

/**
 * Verification template data
 */
export interface VerificationTemplateData extends EmailTemplateData {
  verificationUrl: string
  expiryHours: number
}

/**
 * Password reset template data
 */
export interface ResetTemplateData extends EmailTemplateData {
  resetUrl: string
  expiryHours: number
}

/**
 * Welcome template data
 */
export interface WelcomeTemplateData extends EmailTemplateData {
  loginUrl: string
  supportEmail: string
}

/**
 * Two-factor authentication template data
 */
export interface TwoFactorTemplateData extends EmailTemplateData {
  code: string
  expiryMinutes: number
}

/**
 * Recovery codes template data
 */
export interface RecoveryTemplateData extends EmailTemplateData {
  codes: string[]
  setupDate: string
}

/**
 * Template data map type
 */
export interface TemplateDataMap {
  verification: VerificationTemplateData
  reset: ResetTemplateData
  welcome: WelcomeTemplateData
  '2fa': TwoFactorTemplateData
  recovery: RecoveryTemplateData
}

/**
 * Email configuration interface
 */
export interface EmailConfig {
  from: {
    name: string
    address: string
  }
  smtp: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
}

/**
 * Email send options
 */
export interface EmailSendOptions {
  to: string
  subject: string
  templateType: EmailTemplateType
  templateData: EmailTemplateData
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}
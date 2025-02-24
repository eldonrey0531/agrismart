import { createTransport } from 'nodemailer'
import { sign, verify } from 'jsonwebtoken'
import { User } from '@/server/models/user'
import { redis } from '@/lib/redis'

const EMAIL_SECRET = process.env.EMAIL_VERIFICATION_SECRET || 'your-secret-key'
const EMAIL_EXPIRY = 24 * 60 * 60 // 24 hours
const RATE_LIMIT_PREFIX = 'email-verify:'

interface EmailConfig {
  from: string
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

const emailConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@example.com',
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

interface VerificationResult {
  success: boolean
  message: string
  userId?: string
}

export class EmailVerificationService {
  private transporter = createTransport(emailConfig.smtp)

  /**
   * Generate verification token
   */
  private generateToken(userId: string): string {
    return sign({ userId }, EMAIL_SECRET, { expiresIn: EMAIL_EXPIRY })
  }

  /**
   * Verify token
   */
  private async verifyToken(token: string): Promise<string | null> {
    try {
      const decoded = verify(token, EMAIL_SECRET) as { userId: string }
      return decoded.userId
    } catch {
      return null
    }
  }

  /**
   * Check rate limit for email sending
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    const key = `${RATE_LIMIT_PREFIX}${userId}`
    const attempts = await redis.incr(key)
    
    if (attempts === 1) {
      await redis.expire(key, 60 * 60) // 1 hour window
    }

    return attempts <= 3 // Max 3 attempts per hour
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(userId: string, email: string): Promise<boolean> {
    try {
      // Check rate limit
      if (!await this.checkRateLimit(userId)) {
        throw new Error('Too many verification attempts. Please try again later.')
      }

      const token = this.generateToken(userId)
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification</h1>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        `
      })

      return true
    } catch (error) {
      console.error('Failed to send verification email:', error)
      return false
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<VerificationResult> {
    try {
      const userId = await this.verifyToken(token)
      if (!userId) {
        return {
          success: false,
          message: 'Invalid or expired verification token'
        }
      }

      const user = await User.findById(userId)
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      if (user.emailVerified) {
        return {
          success: false,
          message: 'Email already verified',
          userId
        }
      }

      // Update user
      user.emailVerified = true
      user.emailVerificationToken = undefined
      user.emailVerificationExpires = undefined
      await user.save()

      return {
        success: true,
        message: 'Email verified successfully',
        userId
      }
    } catch (error) {
      console.error('Email verification failed:', error)
      return {
        success: false,
        message: 'Verification failed'
      }
    }
  }

  /**
   * Request new verification email
   */
  async resendVerification(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId)
      if (!user || user.emailVerified) {
        return false
      }

      return this.sendVerificationEmail(userId, user.email)
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const emailVerification = new EmailVerificationService()

// Export types
export type { VerificationResult }
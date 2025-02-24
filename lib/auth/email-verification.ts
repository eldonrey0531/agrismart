import { type User } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/redis'
import { createToken, verifyToken } from '@/lib/jwt'
import { emailService, generateEmailTemplate } from '@/lib/utils/email'

// Constants
const RATE_LIMIT_PREFIX = 'email-verify:'
const VERIFICATION_PREFIX = 'verify-timeout:'
const RESEND_PREFIX = 'resend-cooldown:'
const MAX_ATTEMPTS = 3 // Maximum attempts per hour
const TOKEN_EXPIRY = '24h'
const EXPIRY_HOURS = 24
const RESEND_COOLDOWN = 60 * 5 // 5 minutes cooldown
const VERIFICATION_TIMEOUT = 60 * 60 * 24 // 24 hours timeout

export interface VerificationResult {
  success: boolean
  message: string
  userId?: string
  error?: string
}

export interface VerificationPayload {
  userId: string
  email: string
}

export class EmailVerificationService {
  /**
   * Check rate limit for verification attempts
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    const key = `${RATE_LIMIT_PREFIX}${userId}`
    const attempts = await redis.incr(key)
    
    if (attempts === 1) {
      await redis.expire(key, 60 * 60) // 1 hour window
    }

    return attempts <= MAX_ATTEMPTS
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    return emailService.testConnection()
  }

  /**
   * Check resend cooldown
   */
  private async checkResendCooldown(userId: string): Promise<boolean> {
    const key = `${RESEND_PREFIX}${userId}`
    const cooldown = await redis.get(key)
    return !cooldown
  }

  /**
   * Set resend cooldown
   */
  private async setResendCooldown(userId: string): Promise<void> {
    const key = `${RESEND_PREFIX}${userId}`
    await redis.setex(key, RESEND_COOLDOWN, '1')
  }

  /**
   * Check if verification is still valid
   */
  private async checkVerificationValidity(userId: string): Promise<boolean> {
    const key = `${VERIFICATION_PREFIX}${userId}`
    const isValid = await redis.get(key)
    return !!isValid
  }

  /**
   * Set verification timeout
   */
  private async setVerificationTimeout(userId: string): Promise<void> {
    const key = `${VERIFICATION_PREFIX}${userId}`
    await redis.setex(key, VERIFICATION_TIMEOUT, '1')
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(
    userId: string,
    email: string,
    name?: string | null
  ): Promise<boolean> {
    try {
      // Check rate limit
      if (!await this.checkRateLimit(userId)) {
        throw new Error('Too many verification attempts. Please try again later.')
      }

      // Set verification timeout
      await this.setVerificationTimeout(userId)

      // Create verification token
      const token = await createToken('verify', { userId, email }, { 
        expiresIn: TOKEN_EXPIRY 
      })

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

      // Generate email content
      const template = generateEmailTemplate('verification', {
        name: name || 'there',
        verificationUrl,
        appName: process.env.APP_NAME || 'Your App',
        expiryHours: EXPIRY_HOURS
      })

      // Send email
      const sent = await emailService.sendEmail(
        email,
        'Verify Your Email Address',
        template
      )

      if (!sent) {
        throw new Error('Failed to send verification email')
      }

      // Log success
      console.info('Verification email sent:', {
        userId,
        email,
        timestamp: new Date().toISOString()
      })

      return true
    } catch (error) {
      // Log error
      console.error('Failed to send verification email:', {
        userId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      
      return false
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<VerificationResult> {
    try {
      const payload = await verifyToken('verify', token)
      const { userId, email } = payload

      // Check if verification window is still valid
      if (!await this.checkVerificationValidity(userId)) {
        return {
          success: false,
          message: 'Verification link has expired. Please request a new one.',
          userId
        }
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      if (user.email !== email) {
        return {
          success: false,
          message: 'Invalid verification token'
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
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: new Date(),
          status: 'ACTIVE'
        }
      })

      // Log verification
      console.info('Email verified:', {
        userId,
        email,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        message: 'Email verified successfully',
        userId
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed'
      
      // Log error
      console.error('Email verification failed:', {
        token,
        error: message,
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        message,
        error: message
      }
    }
  }

  /**
   * Request new verification email
   */
  async resendVerification(email: string): Promise<VerificationResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

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
          userId: user.id
        }
      }

      // Check resend cooldown
      if (!await this.checkResendCooldown(user.id)) {
        return {
          success: false,
          message: 'Please wait before requesting another verification email',
          userId: user.id
        }
      }

      const sent = await this.sendVerificationEmail(user.id, email, user.name)
      if (!sent) {
        throw new Error('Failed to send verification email')
      }

      // Set resend cooldown
      await this.setResendCooldown(user.id)

      return {
        success: true,
        message: 'Verification email sent',
        userId: user.id
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification'
      
      // Log error
      console.error('Resend verification failed:', {
        email,
        error: message,
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        message,
        error: message
      }
    }
  }
}

// Export singleton instance
export const emailVerification = new EmailVerificationService()

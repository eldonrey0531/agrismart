import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { validatePassword } from '@/lib/utils/password-validation'
import { getIP } from '@/lib/utils/ip'
import { passwordRateLimit } from '@/lib/utils/rate-limit'
import { sendPasswordChangedEmail } from '@/lib/utils/email-service'
import { logSecurityEvent, SecurityEventType } from '@/lib/utils/security-logger'
import type { NextRequest } from 'next/server'

interface PasswordUpdateRequest {
  currentPassword: string
  newPassword: string
}

export async function PUT(req: NextRequest) {
  try {
    // Get client IP and check rate limit
    const ip = getIP(req)
    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const rateLimit = passwordRateLimit.check(`password_change:${ip}`)

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many attempts',
          message: 'Please try again later',
          resetAt: rateLimit.reset
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.reset.getTime() - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const token = await getToken({ req })
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json() as PasswordUpdateRequest
    const { currentPassword, newPassword } = data

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both current and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    const validation = validatePassword(newPassword)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Password requirements not met',
          details: validation.errors,
          strength: validation.score
        },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: token.id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true
      }
    })

    if (!user || !user.password || !user.email) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      // Log failed attempt
      await logSecurityEvent({
        userId: user.id,
        eventType: SecurityEventType.PASSWORD_CHANGE_ATTEMPT,
        ipAddress: ip,
        userAgent,
        details: { success: false, reason: 'Invalid current password' }
      })

      // Increment rate limit counter
      passwordRateLimit.increment(`password_change:${ip}`)
      
      return NextResponse.json(
        {
          error: 'Current password is incorrect',
          remaining: rateLimit.remaining - 1
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    // Log successful password change
    await logSecurityEvent({
      userId: user.id,
      eventType: SecurityEventType.PASSWORD_CHANGE,
      ipAddress: ip,
      userAgent,
      details: { success: true }
    })

    // Send email notification
    await sendPasswordChangedEmail({
      to: user.email,
      name: user.name || undefined,
      ipAddress: ip,
      userAgent,
      timestamp: new Date()
    })

    // Reset rate limit after successful update
    passwordRateLimit.reset(`password_change:${ip}`)

    return NextResponse.json({
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
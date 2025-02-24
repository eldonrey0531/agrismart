import { prisma } from '@/lib/db'

export enum SecurityEventType {
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_CHANGE_ATTEMPT = 'PASSWORD_CHANGE_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED'
}

interface SecurityLogEntry {
  userId: string
  eventType: SecurityEventType
  ipAddress: string
  userAgent?: string
  details?: Record<string, any>
}

export async function logSecurityEvent({
  userId,
  eventType,
  ipAddress,
  userAgent,
  details
}: SecurityLogEntry) {
  try {
    await prisma.securityLog.create({
      data: {
        userId,
        eventType,
        ipAddress,
        userAgent: userAgent || 'Unknown',
        details: details ? JSON.stringify(details) : null,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
    // Don't throw - logging should not break the main flow
  }
}

export function getFormattedEventDetails(details: Record<string, any>): string {
  const formatted = Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  return formatted
}

export async function getRecentSecurityEvents(userId: string, limit = 10) {
  return await prisma.securityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}
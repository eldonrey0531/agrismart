import { prisma, DatabaseError } from './index'
import type { SecurityEventType } from '@/types/security'

// Input types
interface SecurityLogInput {
  userId: string
  eventType: SecurityEventType
  ipAddress: string
  userAgent: string
  details?: Record<string, any>
}

interface SecurityLogQuery {
  userId: string
  eventType?: SecurityEventType
  fromDate?: Date
  toDate?: Date
  limit?: number
  offset?: number
}

/**
 * Create a new security log entry
 */
export async function createSecurityLog(data: SecurityLogInput) {
  try {
    return await prisma.securityLog.create({
      data: {
        ...data,
        details: data.details ? JSON.stringify(data.details) : null
      }
    })
  } catch (error) {
    throw new DatabaseError('Failed to create security log', error)
  }
}

/**
 * Get security logs with pagination and filtering
 */
export async function getSecurityLogs({
  userId,
  eventType,
  fromDate,
  toDate,
  limit = 50,
  offset = 0
}: SecurityLogQuery) {
  try {
    // Build where clause
    const where = {
      userId,
      ...(eventType && { eventType }),
      ...(fromDate || toDate) && {
        createdAt: {
          ...(fromDate && { gte: fromDate }),
          ...(toDate && { lte: toDate })
        }
      }
    }

    // Get total count for pagination
    const total = await prisma.securityLog.count({ where })

    // Get paginated results
    const logs = await prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100), // Cap at 100 records
      skip: offset
    })

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : undefined
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total
      }
    }
  } catch (error) {
    throw new DatabaseError('Failed to fetch security logs', error)
  }
}

/**
 * Get recent security events for a user
 */
export async function getRecentSecurityLogs(userId: string, limit = 5) {
  try {
    const logs = await prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : undefined
    }))
  } catch (error) {
    throw new DatabaseError('Failed to fetch recent security logs', error)
  }
}

/**
 * Clean up old security logs
 */
export async function cleanupSecurityLogs(
  olderThan: Date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
) {
  try {
    const { count } = await prisma.securityLog.deleteMany({
      where: {
        createdAt: { lt: olderThan }
      }
    })
    return count
  } catch (error) {
    throw new DatabaseError('Failed to cleanup security logs', error)
  }
}

/**
 * Get security activity summary for a user
 */
export async function getSecuritySummary(userId: string) {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [recentActivity, weeklyActivity] = await Promise.all([
      prisma.securityLog.count({
        where: {
          userId,
          createdAt: { gte: last24Hours }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId,
          createdAt: { gte: last7Days }
        }
      })
    ])

    return {
      last24Hours: recentActivity,
      last7Days: weeklyActivity
    }
  } catch (error) {
    throw new DatabaseError('Failed to get security summary', error)
  }
}
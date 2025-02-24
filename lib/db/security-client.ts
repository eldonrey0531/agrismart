import { prisma, DatabaseError } from './index'
import { SecurityEventType } from '@/types/security'
import type {
  SQLCondition,
  SQLQueryOptions
} from './sql-utils'
import {
  buildSafeQuery,
  formatSQLValue
} from './sql-utils'

interface SecurityLogCreateInput {
  userId: string
  eventType: SecurityEventType
  ipAddress: string
  userAgent: string
  details?: Record<string, any>
}

interface SecurityLogQuery {
  userId: string
  eventType?: SecurityEventType
  createdAt?: {
    gte?: Date
    lte?: Date
  }
  skip?: number
  take?: number
}

interface SecurityLog {
  id: string
  userId: string
  eventType: SecurityEventType
  ipAddress: string
  userAgent: string
  details: string | null
  createdAt: Date
}

interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
}

/**
 * SecurityLog database operations with SQL injection protection
 */
class SecurityLogClient {
  private readonly tableName = 'SecurityLog'

  /**
   * Create a new security log entry
   */
  async create(data: SecurityLogCreateInput): Promise<SecurityLog> {
    try {
      const query = buildSafeQuery({
        table: this.tableName,
        columns: ['*'],
        conditions: [] // No conditions for INSERT
      })

      const insertQuery = `
        INSERT INTO "${this.tableName}" (
          id,
          "userId",
          "eventType",
          "ipAddress",
          "userAgent",
          details,
          "createdAt"
        )
        VALUES (
          gen_random_uuid(),
          ${formatSQLValue(data.userId)},
          ${formatSQLValue(data.eventType)},
          ${formatSQLValue(data.ipAddress)},
          ${formatSQLValue(data.userAgent)},
          ${formatSQLValue(data.details)},
          NOW()
        )
        RETURNING *;
      `

      const [result] = await prisma.$queryRawUnsafe<SecurityLog[]>(insertQuery)
      return result
    } catch (error) {
      throw new DatabaseError('Failed to create security log', error)
    }
  }

  /**
   * Find security logs with filtering and pagination
   */
  async findMany(params: SecurityLogQuery): Promise<PaginatedResult<SecurityLog>> {
    try {
      const { userId, eventType, createdAt, skip = 0, take = 50 } = params

      // Build conditions safely
      const conditions: SQLCondition[] = [
        { column: 'userId', operator: '=', value: userId }
      ]

      if (eventType) {
        conditions.push({
          column: 'eventType',
          operator: '=',
          value: eventType
        })
      }

      if (createdAt?.gte) {
        conditions.push({
          column: 'createdAt',
          operator: '>=',
          value: createdAt.gte
        })
      }

      if (createdAt?.lte) {
        conditions.push({
          column: 'createdAt',
          operator: '<=',
          value: createdAt.lte
        })
      }

      // Build and execute queries
      const queryOptions: SQLQueryOptions = {
        table: this.tableName,
        conditions,
        orderBy: { column: 'createdAt', direction: 'DESC' },
        pagination: { take, skip, maxLimit: 100 }
      }

      const countOptions: SQLQueryOptions = {
        ...queryOptions,
        columns: ['COUNT(*) as count']
      }

      const [countResult, logs] = await Promise.all([
        prisma.$queryRawUnsafe<[{ count: string }]>(buildSafeQuery(countOptions)),
        prisma.$queryRawUnsafe<SecurityLog[]>(buildSafeQuery(queryOptions))
      ])

      const total = parseInt(countResult[0].count, 10)

      return {
        data: logs,
        total,
        hasMore: skip + logs.length < total
      }
    } catch (error) {
      throw new DatabaseError('Failed to fetch security logs', error)
    }
  }

  /**
   * Get security activity summary
   */
  async getActivitySummary(userId: string) {
    try {
      const queryOptions: SQLQueryOptions = {
        table: this.tableName,
        columns: [
          'COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL \'24 hours\')::integer as last_24h',
          'COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL \'7 days\')::integer as last_7d',
          'COUNT(*) FILTER (WHERE "eventType" LIKE \'%FAILURE%\')::integer as failures'
        ],
        conditions: [{ column: 'userId', operator: '=', value: userId }]
      }

      const [result] = await prisma.$queryRawUnsafe<[{
        last_24h: string
        last_7d: string
        failures: string
      }]>(buildSafeQuery(queryOptions))

      return {
        last24Hours: parseInt(result.last_24h, 10),
        last7Days: parseInt(result.last_7d, 10),
        failedAttempts: parseInt(result.failures, 10)
      }
    } catch (error) {
      throw new DatabaseError('Failed to get activity summary', error)
    }
  }
}

// Export singleton instance
export const securityLogs = new SecurityLogClient()
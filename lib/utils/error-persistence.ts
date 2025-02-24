import { PrismaClient } from '@prisma/client'
import type { PerformanceError } from 'errors'
import type {
  ErrorSeverity,
  AggregationPeriod,
  ErrorRecordModel,
  ErrorAggregationModel
} from '../types/database'

interface ErrorQuery {
  severity?: ErrorSeverity[]
  code?: string[]
  startDate?: Date
  endDate?: Date
  resolved?: boolean
  limit?: number
  offset?: number
}

/**
 * Error persistence manager
 */
export class ErrorPersistence {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Save error to database
   */
  async saveError(error: PerformanceError): Promise<ErrorRecordModel> {
    return this.prisma.errorRecord.create({
      data: {
        code: error.code,
        message: error.message,
        severity: error.severity as ErrorSeverity,
        timestamp: BigInt(error.timestamp),
        context: error.context || {},
        metadata: this.extractMetadata(error),
        stackTrace: this.captureStackTrace(),
        resolved: false
      }
    })
  }

  /**
   * Query errors with filters
   */
  async queryErrors(query: ErrorQuery): Promise<ErrorRecordModel[]> {
    const where: any = {}

    if (query.severity?.length) {
      where.severity = { in: query.severity }
    }

    if (query.code?.length) {
      where.code = { in: query.code }
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {
        ...(query.startDate && { gte: BigInt(query.startDate.getTime()) }),
        ...(query.endDate && { lte: BigInt(query.endDate.getTime()) })
      }
    }

    if (query.resolved !== undefined) {
      where.resolved = query.resolved
    }

    return this.prisma.errorRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: query.offset || 0,
      take: query.limit || 50
    })
  }

  /**
   * Get error aggregations
   */
  async getAggregations(
    period: AggregationPeriod = 'daily',
    timeRange?: { start: Date; end: Date }
  ): Promise<ErrorAggregationModel | null> {
    const start = timeRange?.start.getTime() ?? Date.now() - (24 * 60 * 60 * 1000)
    const end = timeRange?.end.getTime() ?? Date.now()

    // Get existing aggregation or create new one
    const existing = await this.prisma.errorAggregation.findFirst({
      where: {
        period,
        startTime: BigInt(start),
        endTime: BigInt(end)
      }
    })

    if (existing) {
      return existing
    }

    const errors = await this.queryErrors({
      startDate: new Date(start),
      endDate: new Date(end)
    })

    const bySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<ErrorSeverity, number>)

    const byCode = errors.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const timeRangeSeconds = (end - start) / 1000
    const errorRate = errors.length / timeRangeSeconds

    return this.prisma.errorAggregation.create({
      data: {
        period,
        startTime: BigInt(start),
        endTime: BigInt(end),
        totalErrors: errors.length,
        bySeverity,
        byCode,
        errorRate
      }
    })
  }

  /**
   * Mark error as resolved
   */
  async resolveError(id: string, resolvedBy: string): Promise<ErrorRecordModel> {
    return this.prisma.errorRecord.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: BigInt(Date.now()),
        resolvedBy
      }
    })
  }

  /**
   * Delete old errors
   */
  async cleanupErrors(olderThan: Date): Promise<number> {
    const result = await this.prisma.errorRecord.deleteMany({
      where: {
        timestamp: { lt: BigInt(olderThan.getTime()) },
        resolved: true
      }
    })

    return result.count
  }

  /**
   * Extract metadata from error
   */
  private extractMetadata(error: PerformanceError): Record<string, unknown> {
    const metadata: Record<string, unknown> = {}

    if ('field' in error) {
      metadata.field = error.field
      metadata.constraint = error.constraint
    }

    if ('threshold' in error) {
      metadata.metric = error.metric
      metadata.threshold = error.threshold
      metadata.current = error.current
    }

    if ('url' in error) {
      metadata.url = error.url
      metadata.status = error.status
      metadata.responseTime = error.responseTime
    }

    if ('channel' in error) {
      metadata.channel = error.channel
      metadata.target = error.target
    }

    return metadata
  }

  /**
   * Capture stack trace
   */
  private captureStackTrace(): string {
    const stack = new Error().stack
    return stack ? stack.split('\n').slice(2).join('\n') : ''
  }
}
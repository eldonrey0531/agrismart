import type { PrismaClient } from '@prisma/client'

declare global {
  type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info'
  type AggregationPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly'

  interface ErrorRecordModel {
    id: string
    code: string
    message: string
    severity: ErrorSeverity
    timestamp: bigint
    context: Record<string, unknown>
    metadata: Record<string, unknown>
    stackTrace?: string | null
    resolved: boolean
    resolvedAt?: bigint | null
    resolvedBy?: string | null
    createdAt: Date
    updatedAt: Date
  }

  interface ErrorAggregationModel {
    id: string
    period: AggregationPeriod
    startTime: bigint
    endTime: bigint
    totalErrors: number
    bySeverity: Record<ErrorSeverity, number>
    byCode: Record<string, number>
    errorRate: number
    createdAt: Date
  }

  interface Database {
    errorRecord: {
      findMany: (args?: {
        where?: Partial<{
          id: string
          code: string | { in: string[] }
          severity: ErrorSeverity | { in: ErrorSeverity[] }
          timestamp: { gte?: bigint; lte?: bigint }
          resolved: boolean
        }>
        orderBy?: { [K in keyof ErrorRecordModel]?: 'asc' | 'desc' }
        skip?: number
        take?: number
      }) => Promise<ErrorRecordModel[]>
      
      findUnique: (args: {
        where: { id: string }
      }) => Promise<ErrorRecordModel | null>
      
      create: (args: {
        data: Omit<ErrorRecordModel, 'id' | 'createdAt' | 'updatedAt'>
      }) => Promise<ErrorRecordModel>
      
      update: (args: {
        where: { id: string }
        data: Partial<Omit<ErrorRecordModel, 'id' | 'createdAt' | 'updatedAt'>>
      }) => Promise<ErrorRecordModel>
      
      delete: (args: {
        where: { id: string }
      }) => Promise<ErrorRecordModel>
      
      deleteMany: (args: {
        where: {
          timestamp?: { lt?: bigint }
          resolved?: boolean
        }
      }) => Promise<{ count: number }>
    }

    errorAggregation: {
      findFirst: (args: {
        where: {
          period: AggregationPeriod
          startTime: bigint
          endTime: bigint
        }
      }) => Promise<ErrorAggregationModel | null>
      
      create: (args: {
        data: Omit<ErrorAggregationModel, 'id' | 'createdAt'>
      }) => Promise<ErrorAggregationModel>
    }
  }

  // Extend PrismaClient
  interface PrismaClient extends Database {}
}

// Export types for use in other files
export type { 
  ErrorSeverity,
  AggregationPeriod,
  ErrorRecordModel,
  ErrorAggregationModel,
  Database
}
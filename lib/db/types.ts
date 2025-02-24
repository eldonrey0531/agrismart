import { Prisma } from '@prisma/client'

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info'
export type AggregationPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly'

export type OrderDirection = 'asc' | 'desc'

// Input Types
export type ErrorRecordCreateInput = {
  code: string
  message: string
  severity: ErrorSeverity
  timestamp: bigint
  context?: Prisma.JsonValue
  metadata?: Prisma.JsonValue
  stackTrace?: string | null
  resolved?: boolean
  resolvedAt?: bigint | null
  resolvedBy?: string | null
}

export type ErrorRecordUpdateInput = Partial<Omit<ErrorRecordCreateInput, 'timestamp'>>

export type ErrorAggregationCreateInput = {
  period: AggregationPeriod
  startTime: bigint
  endTime: bigint
  totalErrors: number
  bySeverity: Prisma.JsonValue
  byCode: Prisma.JsonValue
  errorRate: number
}

// Query Types
export type ErrorRecordWhereInput = {
  id?: string
  code?: string | { in: string[] }
  severity?: ErrorSeverity | { in: ErrorSeverity[] }
  timestamp?: { gte?: bigint; lte?: bigint }
  resolved?: boolean
}

export type ErrorRecordOrderByInput = {
  [K in keyof ErrorRecordResult]?: OrderDirection
}

export type ErrorAggregationWhereInput = {
  period?: AggregationPeriod
  startTime?: bigint
  endTime?: bigint
}

// Result Types
export interface ErrorRecordResult {
  id: string
  code: string
  message: string
  severity: ErrorSeverity
  timestamp: bigint
  context: Record<string, unknown>
  metadata: Record<string, unknown>
  stackTrace: string | null
  resolved: boolean
  resolvedAt: bigint | null
  resolvedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ErrorAggregationResult {
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

// Prisma Extensions
export type ErrorRecordDelegate = {
  findMany: (args?: {
    where?: ErrorRecordWhereInput
    orderBy?: ErrorRecordOrderByInput | ErrorRecordOrderByInput[]
    skip?: number
    take?: number
  }) => Promise<ErrorRecordResult[]>

  findUnique: (args: {
    where: { id: string }
  }) => Promise<ErrorRecordResult | null>

  create: (args: {
    data: ErrorRecordCreateInput
  }) => Promise<ErrorRecordResult>

  update: (args: {
    where: { id: string }
    data: ErrorRecordUpdateInput
  }) => Promise<ErrorRecordResult>

  delete: (args: {
    where: { id: string }
  }) => Promise<ErrorRecordResult>

  deleteMany: (args: {
    where: ErrorRecordWhereInput
  }) => Promise<{ count: number }>
}

export type ErrorAggregationDelegate = {
  findFirst: (args: {
    where: ErrorAggregationWhereInput
  }) => Promise<ErrorAggregationResult | null>

  create: (args: {
    data: ErrorAggregationCreateInput
  }) => Promise<ErrorAggregationResult>
}

// Extend PrismaClient
declare global {
  namespace PrismaClient {
    interface ExtendedClient extends Omit<PrismaClient, keyof PrismaExtension> {
      errorRecord: ErrorRecordDelegate
      errorAggregation: ErrorAggregationDelegate
    }

    interface PrismaExtension {
      errorRecord: ErrorRecordDelegate
      errorAggregation: ErrorAggregationDelegate
    }
  }
}

export type ExtendedPrismaClient = PrismaClient.ExtendedClient
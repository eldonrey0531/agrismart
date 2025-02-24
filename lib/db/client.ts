import { PrismaClient, Prisma } from '@prisma/client'
import type {
  ErrorRecordDelegate,
  ErrorAggregationDelegate,
  ErrorRecordResult,
  ErrorAggregationResult,
  ErrorRecordCreateInput,
  ErrorRecordUpdateInput,
  ErrorAggregationCreateInput,
  ErrorRecordWhereInput,
  ErrorRecordOrderByInput,
  ErrorAggregationWhereInput,
  ExtendedPrismaClient
} from './types'

class PrismaClientError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message)
    this.name = 'PrismaClientError'
  }
}

let prismaClient: ExtendedPrismaClient | null = null

interface ModelContext {
  prisma: PrismaClient
}

/**
 * Type guards
 */
function hasProperty<K extends string>(obj: unknown, key: K): obj is { [key in K]: unknown } {
  return !!obj && typeof obj === 'object' && key in obj
}

/**
 * Model extension definitions
 */
const modelExtensions = {
  errorRecord: {
    async findMany(
      this: ModelContext,
      args: {
        where?: ErrorRecordWhereInput
        orderBy?: ErrorRecordOrderByInput | ErrorRecordOrderByInput[]
        skip?: number
        take?: number
      } = {}
    ): Promise<ErrorRecordResult[]> {
      try {
        const records = await this.prisma.errorRecord.findMany({
          where: transformWhereInput(args.where),
          orderBy: transformOrderByInput(args.orderBy),
          skip: args.skip,
          take: args.take
        })
        return records.map(mapErrorRecord)
      } catch (error) {
        throw new PrismaClientError('Failed to find error records', error)
      }
    },

    async findUnique(
      this: ModelContext,
      args: { where: { id: string } }
    ): Promise<ErrorRecordResult | null> {
      try {
        const record = await this.prisma.errorRecord.findUnique({
          where: args.where
        })
        return record ? mapErrorRecord(record) : null
      } catch (error) {
        throw new PrismaClientError('Failed to find error record', error)
      }
    },

    async create(
      this: ModelContext,
      args: { data: ErrorRecordCreateInput }
    ): Promise<ErrorRecordResult> {
      try {
        const record = await this.prisma.errorRecord.create({
          data: transformCreateInput(args.data)
        })
        return mapErrorRecord(record)
      } catch (error) {
        throw new PrismaClientError('Failed to create error record', error)
      }
    },

    async update(
      this: ModelContext,
      args: { where: { id: string }; data: ErrorRecordUpdateInput }
    ): Promise<ErrorRecordResult> {
      try {
        const record = await this.prisma.errorRecord.update({
          where: args.where,
          data: transformUpdateInput(args.data)
        })
        return mapErrorRecord(record)
      } catch (error) {
        throw new PrismaClientError('Failed to update error record', error)
      }
    },

    async delete(
      this: ModelContext,
      args: { where: { id: string } }
    ): Promise<ErrorRecordResult> {
      try {
        const record = await this.prisma.errorRecord.delete({
          where: args.where
        })
        return mapErrorRecord(record)
      } catch (error) {
        throw new PrismaClientError('Failed to delete error record', error)
      }
    },

    async deleteMany(
      this: ModelContext,
      args: { where: ErrorRecordWhereInput }
    ): Promise<{ count: number }> {
      try {
        return await this.prisma.errorRecord.deleteMany({
          where: transformWhereInput(args.where)
        })
      } catch (error) {
        throw new PrismaClientError('Failed to delete error records', error)
      }
    }
  },

  errorAggregation: {
    async findFirst(
      this: ModelContext,
      args: { where: ErrorAggregationWhereInput }
    ): Promise<ErrorAggregationResult | null> {
      try {
        const record = await this.prisma.errorAggregation.findFirst({
          where: transformWhereInput(args.where)
        })
        return record ? mapErrorAggregation(record) : null
      } catch (error) {
        throw new PrismaClientError('Failed to find error aggregation', error)
      }
    },

    async create(
      this: ModelContext,
      args: { data: ErrorAggregationCreateInput }
    ): Promise<ErrorAggregationResult> {
      try {
        const record = await this.prisma.errorAggregation.create({
          data: transformCreateInput(args.data)
        })
        return mapErrorAggregation(record)
      } catch (error) {
        throw new PrismaClientError('Failed to create error aggregation', error)
      }
    }
  }
} as const

/**
 * Input transformers
 */
function transformWhereInput(where: Record<string, unknown> = {}): Record<string, unknown> {
  const transformed: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(where)) {
    if (value && typeof value === 'object') {
      if (hasProperty(value, 'in') && Array.isArray(value.in)) {
        transformed[key] = { in: value.in }
      } else if (hasProperty(value, 'gte') || hasProperty(value, 'lte')) {
        transformed[key] = {
          ...(hasProperty(value, 'gte') && { gte: BigInt(String(value.gte)) }),
          ...(hasProperty(value, 'lte') && { lte: BigInt(String(value.lte)) })
        }
      } else {
        transformed[key] = value
      }
    } else {
      transformed[key] = value
    }
  }

  return transformed
}

function transformOrderByInput(orderBy?: ErrorRecordOrderByInput | ErrorRecordOrderByInput[]): unknown {
  if (!orderBy) return undefined
  
  if (Array.isArray(orderBy)) {
    return orderBy.map(clause => 
      Object.fromEntries(
        Object.entries(clause).map(([key, value]) => [key, String(value).toLowerCase()])
      )
    )
  }
  
  return Object.fromEntries(
    Object.entries(orderBy).map(([key, value]) => [key, String(value).toLowerCase()])
  )
}

function transformCreateInput(data: Record<string, unknown>): Record<string, unknown> {
  const transformed = { ...data }
  
  if (hasProperty(transformed, 'timestamp')) {
    transformed.timestamp = BigInt(String(transformed.timestamp))
  }
  if (hasProperty(transformed, 'resolvedAt') && transformed.resolvedAt) {
    transformed.resolvedAt = BigInt(String(transformed.resolvedAt))
  }
  if (hasProperty(transformed, 'context')) {
    transformed.context = transformed.context ?? {}
  }
  if (hasProperty(transformed, 'metadata')) {
    transformed.metadata = transformed.metadata ?? {}
  }
  
  return transformed
}

function transformUpdateInput(data: Record<string, unknown>): Record<string, unknown> {
  return transformCreateInput(data)
}

/**
 * Data mappers
 */
function mapErrorRecord(record: Record<string, unknown>): ErrorRecordResult {
  return {
    ...record,
    timestamp: BigInt(String(record.timestamp)),
    resolvedAt: record.resolvedAt ? BigInt(String(record.resolvedAt)) : null,
    context: record.context as Record<string, unknown>,
    metadata: record.metadata as Record<string, unknown>,
    createdAt: new Date(record.createdAt as string | number),
    updatedAt: new Date(record.updatedAt as string | number)
  } as ErrorRecordResult
}

function mapErrorAggregation(record: Record<string, unknown>): ErrorAggregationResult {
  return {
    ...record,
    startTime: BigInt(String(record.startTime)),
    endTime: BigInt(String(record.endTime)),
    bySeverity: record.bySeverity as Record<string, number>,
    byCode: record.byCode as Record<string, number>,
    createdAt: new Date(record.createdAt as string | number)
  } as ErrorAggregationResult
}

/**
 * Create extended Prisma client singleton
 */
export function getPrismaClient(): ExtendedPrismaClient {
  if (!prismaClient) {
    const client = new PrismaClient()
    prismaClient = client.$extends({
      model: modelExtensions
    }) as unknown as ExtendedPrismaClient
  }
  return prismaClient
}

export default getPrismaClient()
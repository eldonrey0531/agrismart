import { PrismaClient, Prisma } from '@prisma/client'
import type {
  ErrorRecordResult,
  ErrorAggregationResult,
  ErrorRecordCreateInput,
  ErrorRecordUpdateInput,
  ErrorRecordWhereInput,
  ErrorRecordOrderByInput,
  ErrorAggregationWhereInput,
  ErrorAggregationCreateInput
} from './types'

interface QueryResult {
  count: string | number
}

interface ErrorRecordRaw extends Omit<ErrorRecordResult, 'context' | 'metadata'> {
  context: string
  metadata: string
}

interface ErrorAggregationRaw extends Omit<ErrorAggregationResult, 'bySeverity' | 'byCode'> {
  bySeverity: string
  byCode: string
}

/**
 * Extended PrismaClient for testing
 */
export class TestPrismaClient extends PrismaClient {
  // ErrorRecord operations
  async findErrorRecords(args: {
    where?: ErrorRecordWhereInput
    orderBy?: ErrorRecordOrderByInput | ErrorRecordOrderByInput[]
    skip?: number
    take?: number
  } = {}): Promise<ErrorRecordResult[]> {
    const records = await this.$queryRaw<ErrorRecordRaw[]>`
      SELECT * FROM "ErrorRecord"
      ${args.where ? Prisma.sql`WHERE ${this.buildWhereClause(args.where)}` : Prisma.empty}
      ${args.orderBy ? Prisma.sql`ORDER BY ${this.buildOrderByClause(args.orderBy)}` : Prisma.empty}
      ${args.skip ? Prisma.sql`OFFSET ${args.skip}` : Prisma.empty}
      ${args.take ? Prisma.sql`LIMIT ${args.take}` : Prisma.empty}
    `

    return records.map(this.mapErrorRecord)
  }

  async countErrorRecords(where?: ErrorRecordWhereInput): Promise<number> {
    const [result] = await this.$queryRaw<QueryResult[]>`
      SELECT COUNT(*) as count FROM "ErrorRecord"
      ${where ? Prisma.sql`WHERE ${this.buildWhereClause(where)}` : Prisma.empty}
    `
    return Number(result.count)
  }

  // ErrorAggregation operations
  async findErrorAggregations(args: {
    where?: ErrorAggregationWhereInput
    take?: number
    orderBy?: { startTime?: 'asc' | 'desc' }
  } = {}): Promise<ErrorAggregationResult[]> {
    const records = await this.$queryRaw<ErrorAggregationRaw[]>`
      SELECT * FROM "ErrorAggregation"
      ${args.where ? Prisma.sql`WHERE ${this.buildWhereClause(args.where)}` : Prisma.empty}
      ${args.orderBy?.startTime ? Prisma.sql`ORDER BY startTime ${Prisma.sql([args.orderBy.startTime])}` : Prisma.empty}
      ${args.take ? Prisma.sql`LIMIT ${args.take}` : Prisma.empty}
    `

    return records.map(this.mapErrorAggregation)
  }

  // Cleanup utilities
  async cleanupTestData(): Promise<void> {
    await this.$transaction([
      this.$executeRaw`TRUNCATE TABLE "ErrorRecord" CASCADE`,
      this.$executeRaw`TRUNCATE TABLE "ErrorAggregation" CASCADE`
    ])
  }

  // Helper methods
  private buildWhereClause(where: Record<string, unknown>): Prisma.Sql {
    const conditions = Object.entries(where).map(([key, value]) => {
      if (value === null) {
        return Prisma.sql`${Prisma.raw(key)} IS NULL`
      }
      if (typeof value === 'object') {
        if ('in' in value && Array.isArray(value.in)) {
          return Prisma.sql`${Prisma.raw(key)} IN (${Prisma.join(value.in.map(v => Prisma.sql`${v}`))})`
        }
        if ('gte' in value || 'lte' in value) {
          const conditions = []
          if ('gte' in value) {
            conditions.push(Prisma.sql`${Prisma.raw(key)} >= ${value.gte}`)
          }
          if ('lte' in value) {
            conditions.push(Prisma.sql`${Prisma.raw(key)} <= ${value.lte}`)
          }
          return Prisma.join(conditions, ' AND ')
        }
      }
      return Prisma.sql`${Prisma.raw(key)} = ${value}`
    })
    return Prisma.join(conditions, ' AND ')
  }

  private buildOrderByClause(orderBy: Record<string, string> | Record<string, string>[]): Prisma.Sql {
    if (Array.isArray(orderBy)) {
      return Prisma.join(
        orderBy.map(clause =>
          Prisma.join(
            Object.entries(clause).map(([key, dir]) =>
              Prisma.sql`${Prisma.raw(key)} ${Prisma.raw(dir.toUpperCase())}`
            ),
            ', '
          )
        ),
        ', '
      )
    }
    return Prisma.join(
      Object.entries(orderBy).map(([key, dir]) =>
        Prisma.sql`${Prisma.raw(key)} ${Prisma.raw(dir.toUpperCase())}`
      ),
      ', '
    )
  }

  private mapErrorRecord(record: ErrorRecordRaw): ErrorRecordResult {
    return {
      ...record,
      context: JSON.parse(record.context),
      metadata: JSON.parse(record.metadata),
      timestamp: BigInt(record.timestamp),
      resolvedAt: record.resolvedAt ? BigInt(record.resolvedAt) : null,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    }
  }

  private mapErrorAggregation(record: ErrorAggregationRaw): ErrorAggregationResult {
    return {
      ...record,
      bySeverity: JSON.parse(record.bySeverity),
      byCode: JSON.parse(record.byCode),
      startTime: BigInt(record.startTime),
      endTime: BigInt(record.endTime),
      createdAt: new Date(record.createdAt)
    }
  }
}

let testClient: TestPrismaClient | null = null

export function getTestClient(): TestPrismaClient {
  if (!testClient) {
    testClient = new TestPrismaClient()
  }
  return testClient
}

export async function closeTestClient(): Promise<void> {
  if (testClient) {
    await testClient.$disconnect()
    testClient = null
  }
}
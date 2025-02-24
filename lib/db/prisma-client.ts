import { PrismaClient } from '@prisma/client'
import type { ErrorRecordModel, ErrorAggregationModel } from '../types/database'

declare module '@prisma/client' {
  interface PrismaClient {
    errorRecord: {
      findMany: (args?: any) => Promise<ErrorRecordModel[]>
      findUnique: (args: { where: { id: string } }) => Promise<ErrorRecordModel | null>
      create: (args: { data: any }) => Promise<ErrorRecordModel>
      update: (args: { where: { id: string }; data: any }) => Promise<ErrorRecordModel>
      delete: (args: { where: { id: string } }) => Promise<ErrorRecordModel>
      deleteMany: (args: { where: any }) => Promise<{ count: number }>
    }
    errorAggregation: {
      findFirst: (args: { where: any }) => Promise<ErrorAggregationModel | null>
      create: (args: { data: any }) => Promise<ErrorAggregationModel>
    }
  }
}

/**
 * Extended Prisma client with custom model methods
 */
const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      errorRecord: {
        async findMany(args: any) {
          const records = await (this as any).$queryRaw`
            SELECT * FROM error_records
            ${args.where ? `WHERE ${buildWhereClause(args.where)}` : ''}
            ${args.orderBy ? `ORDER BY ${buildOrderByClause(args.orderBy)}` : ''}
            ${args.take ? `LIMIT ${args.take}` : ''}
            ${args.skip ? `OFFSET ${args.skip}` : ''}
          `
          return mapRecords(records)
        },

        async create(args: { data: any }) {
          const record = await (this as any).$queryRaw`
            INSERT INTO error_records ${buildInsertClause(args.data)}
            RETURNING *
          `
          return mapRecord(record[0])
        },

        async update(args: { where: { id: string }; data: any }) {
          const record = await (this as any).$queryRaw`
            UPDATE error_records
            SET ${buildUpdateClause(args.data)}
            WHERE id = ${args.where.id}
            RETURNING *
          `
          return mapRecord(record[0])
        }
      },

      errorAggregation: {
        async findFirst(args: { where: any }) {
          const record = await (this as any).$queryRaw`
            SELECT * FROM error_aggregations
            WHERE ${buildWhereClause(args.where)}
            LIMIT 1
          `
          return record[0] ? mapAggregation(record[0]) : null
        },

        async create(args: { data: any }) {
          const record = await (this as any).$queryRaw`
            INSERT INTO error_aggregations ${buildInsertClause(args.data)}
            RETURNING *
          `
          return mapAggregation(record[0])
        }
      }
    }
  })
}

// Helper functions for query building
function buildWhereClause(where: Record<string, any>): string {
  return Object.entries(where)
    .map(([key, value]) => {
      if (typeof value === 'object' && 'in' in value) {
        return `${key} IN (${value.in.map((v: any) => `'${v}'`).join(',')})`
      }
      return `${key} = '${value}'`
    })
    .join(' AND ')
}

function buildOrderByClause(orderBy: Record<string, 'asc' | 'desc'>): string {
  return Object.entries(orderBy)
    .map(([key, direction]) => `${key} ${direction.toUpperCase()}`)
    .join(', ')
}

function buildInsertClause(data: Record<string, any>): string {
  const keys = Object.keys(data)
  const values = Object.values(data).map(v => 
    typeof v === 'object' ? JSON.stringify(v) : v
  )
  return `(${keys.join(',')}) VALUES (${values.map(v => `'${v}'`).join(',')})`
}

function buildUpdateClause(data: Record<string, any>): string {
  return Object.entries(data)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'object' 
        ? `'${JSON.stringify(value)}'`
        : `'${value}'`
      return `${key} = ${formattedValue}`
    })
    .join(', ')
}

// Helper functions for record mapping
function mapRecord(record: any): ErrorRecordModel {
  return {
    ...record,
    context: typeof record.context === 'string' 
      ? JSON.parse(record.context)
      : record.context,
    metadata: typeof record.metadata === 'string'
      ? JSON.parse(record.metadata)
      : record.metadata
  }
}

function mapRecords(records: any[]): ErrorRecordModel[] {
  return records.map(mapRecord)
}

function mapAggregation(record: any): ErrorAggregationModel {
  return {
    ...record,
    bySeverity: typeof record.bySeverity === 'string'
      ? JSON.parse(record.bySeverity)
      : record.bySeverity,
    byCode: typeof record.byCode === 'string'
      ? JSON.parse(record.byCode)
      : record.byCode
  }
}

// Export singleton instance
export const prisma = prismaClientSingleton()

// Export for testing
export const createTestClient = prismaClientSingleton
import { DatabaseError } from './index'

/**
 * SQL injection prevention utilities
 */

// Allowed operators for WHERE clauses
export const VALID_OPERATORS = ['=', '>=', '<=', '>', '<', 'LIKE', 'IN', 'IS'] as const
export type SQLOperator = (typeof VALID_OPERATORS)[number]

// Valid column name pattern
const COLUMN_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/

export interface SQLCondition {
  column: string
  operator: SQLOperator
  value: unknown
}

export interface SQLQueryOptions {
  table: string
  columns?: string[]
  conditions?: SQLCondition[]
  orderBy?: {
    column: string
    direction?: 'ASC' | 'DESC'
  }
  pagination?: {
    take?: number
    skip?: number
    maxLimit?: number
  }
}

/**
 * Escape and quote string values for SQL
 */
export function escapeSQLString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

/**
 * Safely format a value for SQL
 */
export function formatSQLValue(value: unknown): string {
  if (value === null) return 'NULL'
  if (value === undefined) return 'NULL'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (value instanceof Date) return escapeSQLString(value.toISOString())
  if (typeof value === 'object') return escapeSQLString(JSON.stringify(value))
  return escapeSQLString(String(value))
}

/**
 * Validate a column name to prevent SQL injection
 */
export function validateColumnName(name: string): boolean {
  return COLUMN_PATTERN.test(name)
}

/**
 * Safely build a WHERE clause from conditions
 */
export function buildWhereClause(conditions: SQLCondition[]): string {
  const validConditions = conditions
    .filter(({ column, operator }) => 
      validateColumnName(column) && 
      VALID_OPERATORS.includes(operator)
    )
    .map(({ column, operator, value }) => 
      `"${column}" ${operator} ${formatSQLValue(value)}`
    )

  return validConditions.length > 0 
    ? `WHERE ${validConditions.join(' AND ')}`
    : ''
}

/**
 * Build a safe ORDER BY clause
 */
export function buildOrderByClause(
  column: string,
  direction: 'ASC' | 'DESC' = 'DESC'
): string {
  if (!validateColumnName(column)) {
    throw new DatabaseError(`Invalid column name: ${column}`)
  }
  return `ORDER BY "${column}" ${direction}`
}

/**
 * Create a safe LIMIT/OFFSET clause
 */
export function buildPaginationClause(
  take?: number,
  skip?: number,
  maxLimit = 100
): string {
  const limit = take !== undefined 
    ? Math.min(Math.max(1, take), maxLimit)
    : maxLimit
  const offset = skip !== undefined 
    ? Math.max(0, skip)
    : 0
  return `LIMIT ${limit} OFFSET ${offset}`
}

/**
 * Build a complete safe SQL query
 */
export function buildSafeQuery(options: SQLQueryOptions): string {
  const { table, columns = ['*'], conditions = [], orderBy, pagination } = options

  if (!validateColumnName(table)) {
    throw new DatabaseError(`Invalid table name: ${table}`)
  }

  const safeColumns = columns
    .filter(validateColumnName)
    .map(col => `"${col}"`)
    .join(', ')

  const where = buildWhereClause(conditions)
  const order = orderBy ? buildOrderByClause(orderBy.column, orderBy.direction) : ''
  const limit = pagination ? buildPaginationClause(
    pagination.take,
    pagination.skip,
    pagination.maxLimit
  ) : ''

  return [
    `SELECT ${safeColumns}`,
    `FROM "${table}"`,
    where,
    order,
    limit
  ].filter(Boolean).join(' ')
}

export type { DatabaseError }
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Initialize Prisma Client with development logging
export const prisma = global.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? [
          {
            emit: 'stdout',
            level: 'warn',
          },
          {
            emit: 'stdout',
            level: 'error',
          },
        ]
      : ['error'],
  })

// Only assign to global object in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

/**
 * Custom error class for database operations
 */
export class DatabaseError extends Error {
  constructor(
    message: string, 
    public readonly cause?: unknown,
    public readonly code?: string
  ) {
    super(message)
    this.name = 'DatabaseError'

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError)
    }
  }

  static from(error: unknown): DatabaseError {
    if (error instanceof DatabaseError) return error
    return new DatabaseError(
      'Database operation failed',
      error,
      error instanceof Error ? error.name : undefined
    )
  }
}

/**
 * Execute a function within a transaction
 */
export async function transaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await fn(tx as PrismaClient)
    })
  } catch (error) {
    throw DatabaseError.from(error)
  }
}

/**
 * Check database connection health
 */
export async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

/**
 * Safely disconnect from database
 */
export async function disconnect(): Promise<void> {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Failed to disconnect from database:', error)
  }
}

/**
 * Utility to exclude sensitive fields from responses
 */
export function excludeFields<T extends Record<string, any>, K extends keyof T>(
  data: T,
  fields: K[]
): Omit<T, K> {
  const result = { ...data }
  fields.forEach(field => delete result[field])
  return result
}
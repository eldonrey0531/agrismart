import { connectDB } from './client'
import { models } from '@/server/models'
import mongoose, { Document, Query } from 'mongoose'

type MongooseObjectId = mongoose.Types.ObjectId

// Type guard for ObjectId
export function isValidObjectId(id: unknown): id is MongooseObjectId {
  return mongoose.Types.ObjectId.isValid(id as string)
}

// Utility function to ensure we're connected before database operations
export async function withDB<T>(operation: () => Promise<T>): Promise<T> {
  await connectDB()
  return operation()
}

// Helper function to safely convert string to ObjectId
export function toObjectId(id: string | MongooseObjectId): MongooseObjectId {
  if (id instanceof mongoose.Types.ObjectId) {
    return id
  }
  if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id)
  }
  throw new Error('Invalid ObjectId')
}

// Generic pagination type
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Generic pagination result type
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Generic function to handle pagination
export async function paginateQuery<T extends Document>(
  query: Query<T[], T>,
  params: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params

  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    query
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec(),
    query.model.countDocuments(query.getQuery())
  ])

  return {
    items,
    total,
    page,
    limit,
    hasMore: total > page * limit
  }
}

// Error handling wrapper
export async function handleDBOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await withDB(operation)
  } catch (error: any) {
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      throw new Error('Duplicate entry')
    }
    if (error.name === 'ValidationError') {
      throw new Error('Validation failed: ' + Object.values(error.errors).map((e: any) => e.message).join(', '))
    }
    throw error
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  operation: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  await connectDB()
  const session = await mongoose.startSession()
  
  try {
    let result: T | undefined
    await session.withTransaction(async () => {
      result = await operation(session)
    })
    if (result === undefined) {
      throw new Error('Transaction operation did not return a result')
    }
    return result
  } finally {
    await session.endSession()
  }
}

// Populate helper with type safety
export function populateFields<T extends Document>(
  query: Query<T | T[] | null, T>,
  fields: (keyof T)[]
): Query<T | T[] | null, T> {
  fields.forEach(field => {
    query = query.populate(field.toString())
  })
  return query
}

// Clean undefined values from query
export function cleanQuery<T extends Record<string, unknown>>(query: T): Partial<T> {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T]
    }
    return acc
  }, {} as Partial<T>)
}
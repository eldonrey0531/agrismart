import { NextResponse } from 'next/server'
import { securityLogs } from '@/lib/db/security-client'
import { getToken } from 'next-auth/jwt'
import { SecurityEventType, isSecurityEventType } from '@/types/security'
import { z } from 'zod'
import type { NextRequest } from 'next/server'

// Security event type enum for Zod
const SecurityEventEnum = z.enum([
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'PASSWORD_CHANGE',
  'PASSWORD_CHANGE_ATTEMPT',
  'TWO_FACTOR_ENABLED',
  'TWO_FACTOR_DISABLED'
])

// Input validation schemas
const QuerySchema = z.object({
  take: z.coerce.number().min(1).max(100).optional().default(50),
  skip: z.coerce.number().min(0).optional().default(0),
  type: SecurityEventEnum.optional(),
  from: z.string().optional().refine(
    (val) => !val || !isNaN(new Date(val).getTime()),
    { message: 'Invalid from date' }
  ),
  to: z.string().optional().refine(
    (val) => !val || !isNaN(new Date(val).getTime()),
    { message: 'Invalid to date' }
  )
})

// Infer the schema type
type QueryParams = z.infer<typeof QuerySchema>

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req })
    if (!token?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const result = QuerySchema.safeParse(searchParams)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.format() },
        { status: 400 }
      )
    }

    const { take, skip, type, from, to } = result.data

    // Get security logs
    const logs = await securityLogs.findMany({
      userId: token.id,
      eventType: type as SecurityEventType | undefined,
      createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) })
      },
      take,
      skip
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Security events error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch security events',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function HEAD(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token?.id) {
      return new Response(null, { status: 401 })
    }

    const summary = await securityLogs.getActivitySummary(token.id)
    
    return new Response(null, {
      status: 200,
      headers: {
        'X-Total-Events': summary.last7Days.toString(),
        'X-Recent-Events': summary.last24Hours.toString(),
        'X-Failed-Attempts': summary.failedAttempts.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Expose-Headers': 'X-Total-Events, X-Recent-Events, X-Failed-Attempts'
      }
    })
  } catch (error) {
    console.error('Security events HEAD error:', error)
    return new Response(null, { status: 500 })
  }
}

// Options for CORS
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Allow': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
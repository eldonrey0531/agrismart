import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import type { JWT } from 'next-auth/jwt'
import type { UserRole, AccountLevel } from '@/types/next-auth'

/**
 * Authentication context passed to protected handlers
 */
export interface AuthContext {
  userId: string
  email?: string | null
  role: UserRole
  accountLevel: AccountLevel
}

/**
 * Protected API handler type
 */
export type ProtectedApiHandler = (
  req: NextRequest,
  auth: AuthContext
) => Promise<NextResponse> | NextResponse

/**
 * Options for route protection
 */
export interface ApiGuardOptions {
  requiredRole?: UserRole
  requiredAccountLevel?: AccountLevel
}

/**
 * Wraps an API handler with authentication and authorization checks
 */
export function withAuth(
  handler: ProtectedApiHandler,
  options: ApiGuardOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // Get auth token
      const token = await getToken({ req })

      // Check authentication
      if (!token?.sub) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Check role if required
      if (options.requiredRole && token.role !== options.requiredRole) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      // Check account level if required
      if (options.requiredAccountLevel && token.accountLevel !== options.requiredAccountLevel) {
        return NextResponse.json(
          { error: 'Account upgrade required' },
          { status: 403 }
        )
      }

      // Create auth context
      const auth: AuthContext = {
        userId: token.sub,
        email: token.email,
        role: token.role as UserRole,
        accountLevel: token.accountLevel as AccountLevel
      }

      // Add auth headers
      const response = await handler(req, auth)
      response.headers.set('x-user-id', auth.userId)
      response.headers.set('x-user-role', auth.role)
      response.headers.set('x-user-account-level', auth.accountLevel)

      return response
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Create route handlers with auth guards
 */
export function createRouteHandlers(
  handlers: Record<string, ProtectedApiHandler>,
  options: ApiGuardOptions = {}
) {
  return Object.entries(handlers).reduce((acc, [method, handler]) => {
    acc[method] = withAuth(handler, options)
    return acc
  }, {} as Record<string, ReturnType<typeof withAuth>>)
}

// Example usage:
/*
export const { GET, POST } = createRouteHandlers({
  // Regular protected route
  GET: async (req, auth) => {
    return NextResponse.json({ data: 'Protected data' })
  },

  // Protected route with custom logic
  POST: async (req, auth) => {
    const data = await req.json()
    return NextResponse.json({ success: true, data })
  }
})

// Admin-only route
export const { GET } = createRouteHandlers({
  GET: async (req, auth) => {
    return NextResponse.json({ data: 'Admin data' })
  }
}, { requiredRole: 'ADMIN' })

// Seller-only route
export const { GET, PUT } = createRouteHandlers({
  GET: async (req, auth) => {
    return NextResponse.json({ data: 'Seller data' })
  },
  PUT: async (req, auth) => {
    return NextResponse.json({ data: 'Updated seller data' })
  }
}, { requiredAccountLevel: 'SELLER' })
*/
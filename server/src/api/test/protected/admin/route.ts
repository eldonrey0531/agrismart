import { NextResponse } from 'next/server'
import { createRouteHandlers, type ProtectedApiHandler } from '@/lib/auth/api-guard'

/**
 * Admin-only endpoint handler
 */
const adminHandler: ProtectedApiHandler = async (req, auth) => {
  return NextResponse.json({
    message: 'Admin data accessed',
    admin: {
      id: auth.userId,
      email: auth.email,
      role: auth.role
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Create protected route with admin role requirement
 */
export const { GET } = createRouteHandlers(
  { GET: adminHandler },
  { requiredRole: 'ADMIN' }
)

// Example usage:
/*
GET /api/test/protected/admin
Headers: {
  Authorization: 'Bearer <token>'
}

Success Response (200):
{
  message: 'Admin data accessed',
  admin: {
    id: '123',
    email: 'admin@example.com',
    role: 'ADMIN'
  },
  timestamp: '2025-02-16T...'
}

Error Response (403):
{
  error: 'Forbidden'
}
*/
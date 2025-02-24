import { NextResponse } from 'next/server'
import { createRouteHandlers, type ProtectedApiHandler } from '@/lib/auth/api-guard'

/**
 * Seller-only endpoint handler
 */
const sellerHandler: ProtectedApiHandler = async (req, auth) => {
  return NextResponse.json({
    message: 'Seller data accessed',
    seller: {
      id: auth.userId,
      email: auth.email,
      accountLevel: auth.accountLevel,
      // In a real app, we would fetch seller-specific data here
      metrics: {
        products: 42,
        sales: 123,
        revenue: 9876.54
      }
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Create protected route with seller account level requirement
 */
export const { GET } = createRouteHandlers(
  { GET: sellerHandler },
  { requiredAccountLevel: 'SELLER' }
)

// Example usage:
/*
GET /api/test/protected/seller
Headers: {
  Authorization: 'Bearer <token>'
}

Success Response (200):
{
  message: 'Seller data accessed',
  seller: {
    id: '123',
    email: 'seller@example.com',
    accountLevel: 'SELLER',
    metrics: {
      products: 42,
      sales: 123,
      revenue: 9876.54
    }
  },
  timestamp: '2025-02-16T...'
}

Error Response (403):
{
  error: 'Account upgrade required'
}
*/
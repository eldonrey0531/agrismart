import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RateLimiter } from '@/lib/utils/rate-limit'
import { performanceCache } from '@/lib/cache/performance'

// Rate limiting configuration
const RATE_LIMITS = {
  public: {
    points: 60, // Number of requests
    duration: 60, // Per minute
  },
  authenticated: {
    points: 300, // Number of requests
    duration: 60, // Per minute
  }
}

// Create rate limiters
const publicLimiter = new RateLimiter(RATE_LIMITS.public)
const authenticatedLimiter = new RateLimiter(RATE_LIMITS.authenticated)

/**
 * Validates timeframe parameter
 */
function isValidTimeframe(timeframe: string | null): timeframe is '1h' | '24h' | '7d' | '30d' {
  if (!timeframe) return false
  return ['1h', '24h', '7d', '30d'].includes(timeframe)
}

/**
 * Performance monitoring middleware
 */
export async function performanceMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 1. Check rate limits
    const isAuthenticated = request.headers.get('Authorization')?.startsWith('Bearer ')
    const limiter = isAuthenticated ? authenticatedLimiter : publicLimiter
    const identifier = request.ip || 'unknown'

    const rateLimitResult = await limiter.check(identifier)
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter)
          }
        }
      )
    }

    // 2. Validate request parameters
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe')

    if (!isValidTimeframe(timeframe)) {
      return NextResponse.json(
        { error: 'Invalid timeframe parameter' },
        { status: 400 }
      )
    }

    // 3. Track request metrics
    const startTime = Date.now()
    const response = await handler(request)
    const duration = Date.now() - startTime

    // 4. Update performance metrics
    await updateMetrics({
      timeframe,
      duration,
      status: response.status,
      cached: response.headers.get('x-cache') === 'HIT'
    })

    // 5. Add response headers
    response.headers.set('X-Response-Time', `${duration}ms`)
    response.headers.set('X-Rate-Limit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-Rate-Limit-Reset', String(rateLimitResult.reset))

    return response

  } catch (error) {
    console.error('Performance middleware error:', error)
    
    // Clear cache on error
    performanceCache.invalidate()

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Updates performance metrics
 */
async function updateMetrics(data: {
  timeframe: string
  duration: number
  status: number
  cached: boolean
}): Promise<void> {
  try {
    // Store metrics in your database or monitoring service
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: Date.now(),
        type: 'performance',
        data: {
          endpoint: '/api/performance',
          ...data
        }
      })
    })
  } catch (error) {
    // Log but don't fail the request
    console.error('Failed to update metrics:', error)
  }
}

/**
 * Wraps an API route with performance monitoring
 */
export function withPerformanceMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return (request: NextRequest) => performanceMiddleware(request, handler)
}
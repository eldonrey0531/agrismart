import type { NextRequest } from 'next/server'
import { ApiError } from '@/lib/api-response'

export interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

export interface RateLimitContext {
  id: string
  limit: number
  interval: number
  count: number
  reset: Date
}

interface TokenBucket {
  count: number
  lastReset: number
}

/**
 * Simple in-memory rate limiter using token bucket algorithm
 */
export class RateLimit {
  private interval: number
  private maxRequests: number
  private tokens: Map<string, TokenBucket>
  private cleanupInterval: NodeJS.Timeout

  constructor(config: RateLimitConfig) {
    this.interval = config.interval
    this.maxRequests = config.maxRequests
    this.tokens = new Map()

    // Cleanup expired tokens every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60_000)
  }

  /**
   * Generate a unique token for the request
   */
  private getToken(req: NextRequest, action: string): string {
    const ip = req.headers.get('cf-connecting-ip') || 
               req.ip || 
               '127.0.0.1'
    return `${action}:${ip}`
  }

  /**
   * Cleanup expired tokens
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, bucket] of this.tokens.entries()) {
      if (now - bucket.lastReset > this.interval) {
        this.tokens.delete(key)
      }
    }
  }

  /**
   * Check if request is within rate limit
   */
  async check(
    req: NextRequest,
    limit: number,
    action: string
  ): Promise<RateLimitContext> {
    const token = this.getToken(req, action)
    const now = Date.now()
    
    let bucket = this.tokens.get(token)
    
    // Reset bucket if interval has passed
    if (!bucket || now - bucket.lastReset > this.interval) {
      bucket = {
        count: 0,
        lastReset: now
      }
    }

    // Check rate limit
    if (bucket.count >= limit) {
      const resetDate = new Date(bucket.lastReset + this.interval)
      throw new ApiError(
        'TOO_MANY_REQUESTS',
        `Rate limit exceeded. Try again at ${resetDate.toISOString()}`
      )
    }

    // Check global limit
    if (bucket.count >= this.maxRequests) {
      throw new ApiError(
        'TOO_MANY_REQUESTS',
        'Global rate limit exceeded'
      )
    }

    // Increment counter
    bucket.count++
    this.tokens.set(token, bucket)

    return {
      id: token,
      limit,
      interval: this.interval,
      count: bucket.count,
      reset: new Date(bucket.lastReset + this.interval)
    }
  }

  /**
   * Reset rate limit for a specific token
   */
  reset(token: string): void {
    this.tokens.delete(token)
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.tokens.clear()
  }
}

// Export singleton instances for common intervals
export const rateLimits = {
  strict: new RateLimit({ 
    interval: 60 * 1000, // 1 minute
    maxRequests: 30 
  }),
  normal: new RateLimit({ 
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 100
  }),
  relaxed: new RateLimit({ 
    interval: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 1000
  })
}

/**
 * Rate limit middleware
 */
export function withRateLimit(
  handler: Function,
  limit: number,
  action: string,
  limiter: RateLimit = rateLimits.normal
) {
  return async (...args: any[]) => {
    const req = args[0] as NextRequest
    await limiter.check(req, limit, action)
    return handler(...args)
  }
}

export default rateLimits
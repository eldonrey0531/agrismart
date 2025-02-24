import type { ErrorRecordResult, ErrorAggregationResult } from '@/lib/db/types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface PerformanceMetrics {
  totalErrors: number
  errorRate: number
  avgResponseTime: number
  resolvedRate: number
}

interface PerformanceData {
  metrics: PerformanceMetrics
  errorTrend: Array<{
    timestamp: number
    count: number
    responseTime: number
  }>
  recentErrors: ErrorRecordResult[]
  aggregations: ErrorAggregationResult[]
}

type TimeFrame = '1h' | '24h' | '7d' | '30d'

const CACHE_TTL: Record<TimeFrame, number> = {
  '1h': 60_000, // 1 minute
  '24h': 300_000, // 5 minutes
  '7d': 1_800_000, // 30 minutes
  '30d': 3_600_000 // 1 hour
}

class PerformanceCache {
  private static instance: PerformanceCache
  private cache: Map<string, CacheEntry<PerformanceData>>
  private pendingRequests: Map<string, Promise<PerformanceData>>

  private constructor() {
    this.cache = new Map()
    this.pendingRequests = new Map()
    this.startCleanupInterval()
  }

  static getInstance(): PerformanceCache {
    if (!PerformanceCache.instance) {
      PerformanceCache.instance = new PerformanceCache()
    }
    return PerformanceCache.instance
  }

  async get(
    timeframe: TimeFrame,
    fetchFn: () => Promise<PerformanceData>
  ): Promise<PerformanceData> {
    const cacheKey = `performance:${timeframe}`

    // Check if data is already being fetched
    const pendingRequest = this.pendingRequests.get(cacheKey)
    if (pendingRequest) {
      return pendingRequest
    }

    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    // Fetch new data
    try {
      const fetchPromise = fetchFn()
      this.pendingRequests.set(cacheKey, fetchPromise)

      const data = await fetchPromise
      
      // Store in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_TTL[timeframe]
      })

      return data
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  invalidate(timeframe?: TimeFrame): void {
    if (timeframe) {
      this.cache.delete(`performance:${timeframe}`)
    } else {
      this.cache.clear()
    }
  }

  getStats(): {
    cacheSize: number
    pendingRequests: number
    cacheEntries: Array<{ key: string; age: number; ttl: number }>
  } {
    const now = Date.now()
    const cacheEntries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.expiresAt - now
    }))

    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      cacheEntries
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt <= now) {
          this.cache.delete(key)
        }
      }
    }, 60_000) // Clean up every minute
  }

  // Memory pressure handling
  handleMemoryPressure(): void {
    if (process.env.NODE_ENV === 'production') {
      // Keep only the most recent entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, 100) // Keep only last 100 entries

      this.cache.clear()
      for (const [key, value] of entries) {
        this.cache.set(key, value)
      }
    }
  }
}

// Export singleton instance
export const performanceCache = PerformanceCache.getInstance()

// Utility function to wrap fetch calls with cache
export async function getCachedPerformanceData(
  timeframe: TimeFrame,
  fetchFn: () => Promise<PerformanceData>
): Promise<PerformanceData> {
  return performanceCache.get(timeframe, fetchFn)
}

// Add memory pressure handler
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const used = process.memoryUsage()
    if (used.heapUsed / used.heapTotal > 0.9) { // 90% memory usage
      performanceCache.handleMemoryPressure()
    }
  }, 300_000) // Check every 5 minutes
}
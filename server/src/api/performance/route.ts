import { NextRequest, NextResponse } from 'next/server'
import { getTestClient } from '@/lib/db/test-client'
import { getCachedPerformanceData } from '@/lib/cache/performance'
import type { ErrorRecordResult } from '@/lib/db/types'

interface ErrorMetadata {
  responseTime?: number
  browser?: string
  os?: string
  [key: string]: unknown
}

type TimeFrame = '1h' | '24h' | '7d' | '30d'

interface TimeRange {
  start: bigint
  end: bigint
}

const TIME_RANGES: Record<TimeFrame, number> = {
  '1h': 3600000,
  '24h': 86400000,
  '7d': 604800000,
  '30d': 2592000000
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = (searchParams.get('timeframe') || '24h') as TimeFrame

    const data = await getCachedPerformanceData(timeframe, async () => {
      const now = Date.now()
      const timeRange: TimeRange = {
        start: BigInt(now - TIME_RANGES[timeframe]),
        end: BigInt(now)
      }

      const client = getTestClient()

      // Get errors within time range
      const errors = await client.findErrorRecords({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        orderBy: { timestamp: 'desc' }
      })

      // Calculate metrics
      const totalErrors = errors.length
      const resolvedErrors = errors.filter(e => e.resolved).length
      const avgResponseTime = calculateAverageResponseTime(errors)

      // Get error trend (divided into 20 points)
      const trendPoints = generateTrendPoints(errors, timeRange, 20)

      // Get aggregations
      let period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'hourly'
      if (timeframe === '7d') period = 'daily'
      if (timeframe === '30d') period = 'weekly'

      const aggregations = await client.findErrorAggregations({
        where: {
          period,
          startTime: timeRange.start,
          endTime: timeRange.end
        },
        orderBy: { startTime: 'desc' }
      })

      return {
        metrics: {
          totalErrors,
          errorRate: totalErrors / (TIME_RANGES[timeframe] / 1000), // errors per second
          avgResponseTime,
          resolvedRate: resolvedErrors / (totalErrors || 1)
        },
        errorTrend: trendPoints,
        recentErrors: errors.slice(0, 10), // Last 10 errors
        aggregations
      }
    })

    // Add cache control headers
    const response = NextResponse.json(data)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return response

  } catch (error) {
    console.error('Performance API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}

function calculateAverageResponseTime(errors: ErrorRecordResult[]): number {
  const validTimes = errors
    .map(error => (error.metadata as ErrorMetadata).responseTime)
    .filter((time): time is number => typeof time === 'number')

  if (validTimes.length === 0) return 0
  return validTimes.reduce((acc, time) => acc + time, 0) / validTimes.length
}

function generateTrendPoints(
  errors: ErrorRecordResult[],
  timeRange: TimeRange,
  points: number
) {
  const interval = Number(timeRange.end - timeRange.start) / points
  const trendPoints = []

  for (let i = 0; i < points; i++) {
    const pointStart = Number(timeRange.start) + (interval * i)
    const pointEnd = pointStart + interval
    
    const pointErrors = errors.filter(error => {
      const timestamp = Number(error.timestamp)
      return timestamp >= pointStart && timestamp < pointEnd
    })

    trendPoints.push({
      timestamp: pointStart,
      count: pointErrors.length,
      responseTime: calculateAverageResponseTime(pointErrors)
    })
  }

  return trendPoints
}

// Use edge runtime for better performance
export const runtime = 'edge'

// Configure revalidation
export const revalidate = 60 // Revalidate every minute
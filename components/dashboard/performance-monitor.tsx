import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { ErrorRecordResult, ErrorAggregationResult } from '@/lib/db/types'

interface PerformanceMetrics {
  totalErrors: number
  errorRate: number
  avgResponseTime: number
  resolvedRate: number
}

interface TrendPoint {
  timestamp: number
  count: number
  responseTime: number
}

interface PerformanceData {
  metrics: PerformanceMetrics
  errorTrend: TrendPoint[]
  recentErrors: ErrorRecordResult[]
  aggregations: ErrorAggregationResult[]
}

type TimeFrame = '1h' | '24h' | '7d' | '30d'

export default function PerformanceMonitor() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('24h')
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/performance?timeframe=${timeframe}`)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [timeframe])

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-lg" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-600">Failed to load performance data</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <Tabs value={timeframe} onValueChange={(v: TimeFrame) => setTimeframe(v)}>
          <TabsList>
            <TabsTrigger value="1h">1h</TabsTrigger>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Errors"
          value={data.metrics.totalErrors.toLocaleString()}
        />
        <MetricCard
          title="Error Rate"
          value={`${(data.metrics.errorRate * 100).toFixed(2)}%`}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${data.metrics.avgResponseTime.toFixed(2)}ms`}
        />
        <MetricCard
          title="Resolution Rate"
          value={`${(data.metrics.resolvedRate * 100).toFixed(2)}%`}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Error Trend</h3>
        <div className="h-80">
          <TrendGraph data={data.errorTrend} />
        </div>
      </Card>

      <Tabs defaultValue="recent">
        <TabsList className="mb-4">
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
          <TabsTrigger value="aggregations">Aggregations</TabsTrigger>
        </TabsList>
        <TabsContent value="recent">
          <ErrorList errors={data.recentErrors} />
        </TabsContent>
        <TabsContent value="aggregations">
          <AggregationList aggregations={data.aggregations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </Card>
  )
}

function TrendGraph({ data }: { data: TrendPoint[] }) {
  // Simple SVG line graph implementation
  const width = 800
  const height = 300
  const padding = 40

  const maxCount = Math.max(...data.map(d => d.count))
  const maxTime = Math.max(...data.map(d => d.responseTime))
  const minTimestamp = Math.min(...data.map(d => d.timestamp))
  const maxTimestamp = Math.max(...data.map(d => d.timestamp))

  const scaleX = (timestamp: number) =>
    padding + ((timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * (width - 2 * padding)
  const scaleY = (value: number, max: number) =>
    height - padding - (value / max) * (height - 2 * padding)

  const errorLine = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.timestamp)} ${scaleY(d.count, maxCount)}`)
    .join(' ')

  const timeLine = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.timestamp)} ${scaleY(d.responseTime, maxTime)}`)
    .join(' ')

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Grid lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1={padding}
          y1={scaleY((maxCount / 4) * i, maxCount)}
          x2={width - padding}
          y2={scaleY((maxCount / 4) * i, maxCount)}
          stroke="#e5e7eb"
          strokeDasharray="4"
        />
      ))}

      {/* Error count line */}
      <path d={errorLine} stroke="#ef4444" fill="none" strokeWidth={2} />

      {/* Response time line */}
      <path d={timeLine} stroke="#3b82f6" fill="none" strokeWidth={2} />

      {/* Axes */}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#000"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#000"
      />
    </svg>
  )
}

function ErrorList({ errors }: { errors: ErrorRecordResult[] }) {
  return (
    <Card>
      <div className="divide-y">
        {errors.map((error) => (
          <div
            key={error.id}
            className={`p-4 ${error.resolved ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{error.code}</p>
                <p className="text-sm text-gray-600">{error.message}</p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(Number(error.timestamp)).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function AggregationList({ aggregations }: { aggregations: ErrorAggregationResult[] }) {
  return (
    <Card>
      <div className="divide-y">
        {aggregations.map((agg) => (
          <div key={agg.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {agg.period} ({new Date(Number(agg.startTime)).toLocaleDateString()})
                </p>
                <p className="text-sm text-gray-600">
                  Total Errors: {agg.totalErrors}
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Error Rate: {(agg.errorRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
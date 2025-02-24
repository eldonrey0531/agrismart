import { usePerformance } from '@/components/providers/performance-provider'

interface MetricsDisplayProps {
  showReport?: boolean
  className?: string
  compact?: boolean
  showThresholds?: boolean
  onThresholdAlert?: (score: number) => void
}

/**
 * Performance metrics display component
 */
export function MetricsDisplay({
  showReport = false,
  className = '',
  compact = false,
  showThresholds = true,
  onThresholdAlert
}: MetricsDisplayProps) {
  const { metrics, isPerformant, score, report } = usePerformance()

  // Threshold checks
  if (showThresholds && onThresholdAlert && score < 70) {
    onThresholdAlert(score)
  }

  // Performance status color
  const statusColor = isPerformant ? 'text-green-500' : 'text-red-500'
  const scoreColor = score >= 90 ? 'text-green-500' 
    : score >= 70 ? 'text-yellow-500'
    : 'text-red-500'

  if (compact) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <span className="font-mono">{metrics.fps} FPS</span>
        <span className={statusColor}>
          {isPerformant ? '✓' : '⚠'}
        </span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="FPS"
          value={metrics.fps}
          target={60}
          unit="fps"
          className={statusColor}
        />
        <MetricCard
          label="Score"
          value={score}
          target={100}
          unit="%"
          className={scoreColor}
        />
        <MetricCard
          label="Frame Time"
          value={metrics.frameTime}
          target={16.67}
          unit="ms"
        />
        <MetricCard
          label="Total Frames"
          value={metrics.totalFrames}
        />
      </div>

      {/* Issues */}
      {(metrics.jank > 0 || metrics.dropped > 0) && (
        <div className="mt-4 space-y-2">
          {metrics.jank > 0 && (
            <div className="text-yellow-500">
              Jank detected: {metrics.jank} frames
            </div>
          )}
          {metrics.dropped > 0 && (
            <div className="text-red-500">
              Dropped frames: {metrics.dropped}
            </div>
          )}
        </div>
      )}

      {/* Full Report */}
      {showReport && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-sm font-mono whitespace-pre-wrap">
          {report}
        </pre>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: number
  target?: number
  unit?: string
  className?: string
}

function MetricCard({
  label,
  value,
  target,
  unit = '',
  className = ''
}: MetricCardProps) {
  const percentage = target ? (value / target) * 100 : 100
  const statusColor = percentage >= 90 ? 'bg-green-100'
    : percentage >= 70 ? 'bg-yellow-100'
    : 'bg-red-100'

  return (
    <div className={`p-4 rounded-lg ${statusColor}`}>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${className}`}>
        {value.toFixed(1)}{unit}
        {target && (
          <span className="text-sm text-gray-500 ml-1">
            /{target}{unit}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Example usage:
 * ```tsx
 * function App() {
 *   return (
 *     <PerformanceProvider>
 *       <MetricsDisplay 
 *         showReport={true}
 *         onThresholdAlert={(score) => {
 *           console.warn(`Performance score dropped to ${score}`)
 *         }}
 *       />
 *     </PerformanceProvider>
 *   )
 * }
 * ```
 */
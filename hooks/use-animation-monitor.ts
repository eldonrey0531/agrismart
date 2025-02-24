import { useRef, useState, useEffect } from 'react'
import { AnimationMonitor, type PerformanceMetrics } from '@/components/performance/animation-monitor'

export interface UseAnimationMonitorResult {
  metrics: PerformanceMetrics
  isPerformant: boolean
  score: number
  report: string
}

export interface UseAnimationMonitorOptions {
  targetFps?: number
  autoStart?: boolean
  onPerformanceAlert?: (score: number) => void
  threshold?: number
}

export const DEFAULT_METRICS: PerformanceMetrics = {
  fps: 0,
  frameTime: 0,
  jank: 0,
  dropped: 0,
  totalFrames: 0
}

/**
 * Hook for monitoring animation performance
 */
export function useAnimationMonitor({
  targetFps = 60,
  autoStart = true,
  onPerformanceAlert,
  threshold = 70
}: UseAnimationMonitorOptions = {}): UseAnimationMonitorResult {
  const monitorRef = useRef<AnimationMonitor>()
  const [metrics, setMetrics] = useState<PerformanceMetrics>(DEFAULT_METRICS)

  // Initialize monitor
  useEffect(() => {
    monitorRef.current = new AnimationMonitor({
      targetFps,
      onMetricsUpdate: (newMetrics) => {
        setMetrics(newMetrics)
        
        // Check performance threshold
        if (onPerformanceAlert) {
          const score = monitorRef.current?.getPerformanceScore() ?? 0
          if (score < threshold) {
            onPerformanceAlert(score)
          }
        }
      }
    })

    if (autoStart) {
      monitorRef.current.start()
    }

    return () => {
      monitorRef.current?.stop()
    }
  }, [targetFps, autoStart, onPerformanceAlert, threshold])

  const monitor = monitorRef.current

  return {
    metrics,
    isPerformant: monitor?.isPerformant() ?? false,
    score: monitor?.getPerformanceScore() ?? 0,
    report: monitor?.getReport() ?? ''
  }
}
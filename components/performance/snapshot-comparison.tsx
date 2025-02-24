import { useState, useCallback } from 'react'
import type { PerformanceSnapshot } from './debug-utils'
import { Chart } from 'chart.js'

interface SnapshotComparisonProps {
  snapshots: PerformanceSnapshot[]
  onAnalysis?: (analysis: ComparisonAnalysis) => void
  className?: string
}

interface ComparisonAnalysis {
  fpsChange: number
  frameTimeChange: number
  jankDiff: number
  performanceScore: number
  summary: string
  details: string[]
}

/**
 * Performance snapshot comparison component
 */
export function SnapshotComparison({
  snapshots,
  onAnalysis,
  className = ''
}: SnapshotComparisonProps) {
  const [selectedSnapshots, setSelectedSnapshots] = useState<number[]>([])
  const [analysis, setAnalysis] = useState<ComparisonAnalysis>()

  // Initialize comparison chart
  const chartRef = useCallback((node: HTMLCanvasElement | null) => {
    if (!node || selectedSnapshots.length !== 2) return

    const snapshot1 = snapshots[selectedSnapshots[0]]
    const snapshot2 = snapshots[selectedSnapshots[1]]

    const chart = new Chart(node, {
      type: 'line',
      data: {
        labels: Array(Math.max(
          snapshot1.history.length,
          snapshot2.history.length
        )).fill(''),
        datasets: [
          {
            label: `Snapshot 1 (${new Date(snapshot1.timestamp).toLocaleString()})`,
            data: snapshot1.history.map(m => m.fps),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: `Snapshot 2 (${new Date(snapshot2.timestamp).toLocaleString()})`,
            data: snapshot2.history.map(m => m.fps),
            borderColor: 'rgb(192, 75, 75)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'FPS'
            }
          }
        }
      }
    })

    return () => chart.destroy()
  }, [snapshots, selectedSnapshots])

  /**
   * Compare snapshots
   */
  const compareSnapshots = useCallback(() => {
    if (selectedSnapshots.length !== 2) return

    const s1 = snapshots[selectedSnapshots[0]]
    const s2 = snapshots[selectedSnapshots[1]]

    const fpsChange = ((s2.metrics.fps - s1.metrics.fps) / s1.metrics.fps) * 100
    const frameTimeChange = ((s2.metrics.frameTime - s1.metrics.frameTime) / s1.metrics.frameTime) * 100
    const jankDiff = s2.metrics.jank - s1.metrics.jank

    const analysis: ComparisonAnalysis = {
      fpsChange,
      frameTimeChange,
      jankDiff,
      performanceScore: calculatePerformanceScore(s1, s2),
      summary: generateSummary(fpsChange, frameTimeChange, jankDiff),
      details: generateDetails(s1, s2)
    }

    setAnalysis(analysis)
    onAnalysis?.(analysis)
  }, [snapshots, selectedSnapshots, onAnalysis])

  /**
   * Calculate overall performance score
   */
  const calculatePerformanceScore = (s1: PerformanceSnapshot, s2: PerformanceSnapshot): number => {
    const fpsScore = (s2.metrics.fps / s1.metrics.fps) * 50
    const frameTimeScore = (s1.metrics.frameTime / s2.metrics.frameTime) * 30
    const jankScore = Math.max(0, 20 - (s2.metrics.jank - s1.metrics.jank))
    
    return Math.min(100, Math.max(0, fpsScore + frameTimeScore + jankScore))
  }

  /**
   * Generate comparison summary
   */
  const generateSummary = (fpsChange: number, frameTimeChange: number, jankDiff: number): string => {
    const parts = []
    
    if (Math.abs(fpsChange) > 5) {
      parts.push(`FPS ${fpsChange > 0 ? 'improved' : 'decreased'} by ${Math.abs(fpsChange).toFixed(1)}%`)
    }
    
    if (Math.abs(frameTimeChange) > 5) {
      parts.push(`Frame time ${frameTimeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(frameTimeChange).toFixed(1)}%`)
    }
    
    if (jankDiff !== 0) {
      parts.push(`${Math.abs(jankDiff)} ${jankDiff > 0 ? 'more' : 'fewer'} janky frames`)
    }

    return parts.join(', ') || 'No significant changes detected'
  }

  /**
   * Generate detailed comparison
   */
  const generateDetails = (s1: PerformanceSnapshot, s2: PerformanceSnapshot): string[] => {
    return [
      `FPS: ${s1.metrics.fps.toFixed(1)} → ${s2.metrics.fps.toFixed(1)}`,
      `Frame Time: ${s1.metrics.frameTime.toFixed(1)}ms → ${s2.metrics.frameTime.toFixed(1)}ms`,
      `Jank: ${s1.metrics.jank} → ${s2.metrics.jank} frames`,
      `Dropped Frames: ${s1.metrics.dropped} → ${s2.metrics.dropped}`,
      `Environment Changes: ${compareEnvironment(s1, s2)}`
    ]
  }

  /**
   * Compare environment changes
   */
  const compareEnvironment = (s1: PerformanceSnapshot, s2: PerformanceSnapshot): string => {
    const changes = []
    
    if (s1.environment.screen.width !== s2.environment.screen.width ||
        s1.environment.screen.height !== s2.environment.screen.height) {
      changes.push('Screen resolution')
    }
    
    if (s1.environment.screen.pixelRatio !== s2.environment.screen.pixelRatio) {
      changes.push('Pixel ratio')
    }
    
    if (s1.environment.memory && s2.environment.memory) {
      const memoryDiff = (s2.environment.memory.usedJSHeapSize - s1.environment.memory.usedJSHeapSize) / 1024 / 1024
      if (Math.abs(memoryDiff) > 5) {
        changes.push(`Memory usage (${memoryDiff > 0 ? '+' : ''}${memoryDiff.toFixed(1)}MB)`)
      }
    }
    
    return changes.length ? changes.join(', ') : 'No changes'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Snapshot Selection */}
      <div className="flex flex-wrap gap-2">
        {snapshots.map((snapshot, index) => (
          <button
            key={snapshot.timestamp}
            onClick={() => {
              if (selectedSnapshots.includes(index)) {
                setSelectedSnapshots(prev => prev.filter(i => i !== index))
              } else if (selectedSnapshots.length < 2) {
                setSelectedSnapshots(prev => [...prev, index])
              }
            }}
            className={`
              px-3 py-1 rounded text-sm
              ${selectedSnapshots.includes(index)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
          >
            {new Date(snapshot.timestamp).toLocaleString()}
          </button>
        ))}
      </div>

      {/* Comparison Chart */}
      {selectedSnapshots.length === 2 && (
        <>
          <div className="h-64 bg-white p-4 rounded-lg shadow">
            <canvas ref={chartRef} />
          </div>

          <button
            onClick={compareSnapshots}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Compare Snapshots
          </button>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4 bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg">Analysis Results</h3>
              
              {/* Performance Score */}
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold">
                  {analysis.performanceScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">
                  Performance Score
                </div>
              </div>

              {/* Summary */}
              <div className="text-sm">
                {analysis.summary}
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {analysis.details.map((detail, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span>•</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/**
 * Example usage:
 * ```tsx
 * function DebugPanel() {
 *   const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([])
 *   
 *   return (
 *     <div>
 *       <SnapshotComparison
 *         snapshots={snapshots}
 *         onAnalysis={analysis => {
 *           console.log('Performance changed by:', analysis.summary)
 *         }}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
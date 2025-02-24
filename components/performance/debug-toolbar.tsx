import { useState, useCallback } from 'react'
import { usePerformance } from '@/components/providers/performance-provider'
import { MetricsDisplay } from './metrics-display'
import { Chart } from 'chart.js'
import type { PerformanceMetrics } from '@/components/performance/animation-monitor'

interface DebugToolbarProps {
  initiallyOpen?: boolean
  position?: 'top' | 'bottom'
  className?: string
}

/**
 * Performance debugging toolbar
 */
export function DebugToolbar({
  initiallyOpen = false,
  position = 'bottom',
  className = ''
}: DebugToolbarProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [isPaused, setIsPaused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { metrics, report } = usePerformance()

  // Store metrics history
  const [history, setHistory] = useState<PerformanceMetrics[]>([])
  const maxHistory = 100

  // Update history
  const updateHistory = useCallback((metrics: PerformanceMetrics) => {
    if (!isPaused) {
      setHistory(prev => [...prev.slice(-maxHistory), metrics])
    }
  }, [isPaused])

  // Initialize performance graph
  const graphRef = useCallback((node: HTMLCanvasElement | null) => {
    if (!node) return

    const chart = new Chart(node, {
      type: 'line',
      data: {
        labels: Array(maxHistory).fill(''),
        datasets: [{
          label: 'FPS',
          data: history.map(m => m.fps),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          y: {
            min: 0,
            max: 70,
            title: {
              display: true,
              text: 'FPS'
            }
          }
        }
      }
    })

    return () => chart.destroy()
  }, [history])

  const positionClass = position === 'top' 
    ? 'top-0' 
    : 'bottom-0'

  return (
    <div className={`fixed left-0 right-0 ${positionClass} ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-4 -top-8 bg-gray-800 text-white px-3 py-1 rounded-t-lg text-sm"
      >
        {isOpen ? 'Hide' : 'Debug'}
      </button>

      {isOpen && (
        <div className="bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="space-x-4">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-3 py-1 rounded ${
                    isPaused ? 'bg-yellow-500' : 'bg-green-500'
                  } text-white`}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-3 py-1 rounded bg-blue-500 text-white"
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>

              <MetricsDisplay compact />
            </div>

            {/* Performance Graph */}
            {showHistory && (
              <div className="h-40 mb-4">
                <canvas ref={graphRef} />
              </div>
            )}

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <MetricsDisplay 
                  showReport={false}
                  showThresholds={true}
                />
              </div>
              
              <div className="space-y-4">
                <div className="font-mono text-sm">
                  <h3 className="font-bold mb-2">Debug Info:</h3>
                  <ul className="space-y-1">
                    <li>History Size: {history.length}</li>
                    <li>Animation State: {isPaused ? 'Paused' : 'Running'}</li>
                    <li>Last Update: {new Date().toISOString()}</li>
                  </ul>
                </div>

                {/* Performance Report */}
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {report}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Example usage:
 * ```tsx
 * function App() {
 *   return (
 *     <PerformanceProvider>
 *       <YourApp />
 *       <DebugToolbar position="bottom" />
 *     </PerformanceProvider>
 *   )
 * }
 * ```
 */
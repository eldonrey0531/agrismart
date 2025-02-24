import React from 'react'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartEvent,
  type ChartElement,
  type ChartConfiguration
} from 'chart.js'
import type { BenchmarkResult, StatisticalAnalysis } from '@/types/benchmark'
import { performance } from '@/lib/utils/performance'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardProps {
  results: BenchmarkResult[]
  baseline?: BenchmarkResult[]
  refreshInterval?: number
  onAlert?: (message: string) => void
}

export function PerformanceDashboard({
  results,
  baseline,
  refreshInterval = 5000,
  onAlert
}: DashboardProps) {
  const timelineRef = React.useRef<HTMLCanvasElement>(null)
  const distributionRef = React.useRef<HTMLCanvasElement>(null)
  const metricsRef = React.useRef<HTMLCanvasElement>(null)
  
  const [selectedResult, setSelectedResult] = React.useState<BenchmarkResult>()
  const [analysis, setAnalysis] = React.useState<StatisticalAnalysis>()
  const [error, setError] = React.useState<string>()

  // Initialize charts
  React.useEffect(() => {
    if (!timelineRef.current || !results.length) return

    // Timeline chart
    const timelineConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: results.map(r => r.name),
        datasets: [
          {
            label: 'Mean Time (ms)',
            data: results.map(r => r.meanTime),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          baseline ? {
            label: 'Baseline',
            data: results.map(r => 
              baseline.find(b => b.name === r.name)?.meanTime ?? null
            ),
            borderColor: 'rgb(192, 75, 75)',
            borderDash: [5, 5],
            tension: 0.1
          } : null
        ].filter(Boolean)
      },
      options: {
        responsive: true,
        onClick: (event: ChartEvent, elements: ChartElement[]) => {
          if (elements.length > 0) {
            const index = elements[0].index
            setSelectedResult(results[index])
          }
        }
      }
    }

    const timelineChart = new Chart(timelineRef.current, timelineConfig)

    // Distribution chart (if selected result)
    if (selectedResult && distributionRef.current) {
      const distConfig: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: selectedResult.samples.map((_, i) => `Sample ${i + 1}`),
          datasets: [{
            label: 'Sample Time (ms)',
            data: selectedResult.samples,
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Sample Distribution'
            }
          }
        }
      }

      new Chart(distributionRef.current, distConfig)
    }

    return () => timelineChart.destroy()
  }, [results, baseline, selectedResult])

  // Update analysis for selected result
  React.useEffect(() => {
    if (!selectedResult) return

    try {
      const baselineResult = baseline?.find(
        b => b.name === selectedResult.name
      )

      const currentAnalysis = performance.analyzeBenchmark(selectedResult)
      setAnalysis(currentAnalysis)

      if (baselineResult) {
        performance.checkRegression(selectedResult, baselineResult)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      onAlert?.(message)
    }
  }, [selectedResult, baseline, onAlert])

  // Auto-refresh
  React.useEffect(() => {
    if (!refreshInterval) return

    const timer = setInterval(() => {
      if (selectedResult) {
        setAnalysis(performance.analyzeBenchmark(selectedResult))
      }
    }, refreshInterval)

    return () => clearInterval(timer)
  }, [refreshInterval, selectedResult])

  return (
    <div className="space-y-8">
      {/* Performance Overview */}
      <section className="grid grid-cols-3 gap-4">
        <StatCard
          title="Mean Response Time"
          value={`${(results.reduce((acc, r) => acc + r.meanTime, 0) / results.length).toFixed(2)}ms`}
          color="blue"
        />
        
        <StatCard
          title="Operations/Second"
          value={`${(results.reduce((acc, r) => acc + r.opsPerSecond, 0) / results.length).toFixed(2)}`}
          color="green"
        />
        
        <StatCard
          title="Regression Status"
          value={analysis?.isSignificant ? 'Regression Detected' : 'Stable'}
          color={analysis?.isSignificant ? 'red' : 'green'}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-2 gap-8">
        <ChartCard title="Performance Timeline">
          <canvas ref={timelineRef} />
        </ChartCard>
        
        <ChartCard title="Distribution">
          <canvas ref={distributionRef} />
        </ChartCard>
      </section>

      {/* Selected Result Details */}
      {selectedResult && (
        <ResultDetails
          result={selectedResult}
          analysis={analysis}
          metricsRef={metricsRef}
        />
      )}

      {/* Error Alert */}
      {error && (
        <AlertMessage
          message={error}
          onClose={() => setError(undefined)}
        />
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  color: 'blue' | 'green' | 'red'
}

function StatCard({ title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600'
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

interface ResultDetailsProps {
  result: BenchmarkResult
  analysis?: StatisticalAnalysis
  metricsRef: React.RefObject<HTMLCanvasElement>
}

function ResultDetails({ result, analysis, metricsRef }: ResultDetailsProps) {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">
        {result.name} Details
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <MetricItem
          label="Mean Time"
          value={`${result.meanTime.toFixed(2)}ms`}
        />
        
        <MetricItem
          label="Operations/Second"
          value={result.opsPerSecond.toFixed(2)}
        />
        
        <MetricItem
          label="Sample Count"
          value={result.samples.length.toString()}
        />
        
        <MetricItem
          label="Margin"
          value={`${result.margin.toFixed(2)}%`}
        />

        {analysis && (
          <>
            <MetricItem
              label="Standard Deviation"
              value={`±${analysis.stdDev.toFixed(2)}ms`}
            />
            
            <MetricItem
              label="Outliers"
              value={analysis.outliers.length.toString()}
              alert={analysis.outliers.length > 0}
            />
          </>
        )}
      </div>

      {/* Performance Metrics Chart */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-600 mb-2">Metrics</h4>
        <canvas ref={metricsRef} />
      </div>
    </section>
  )
}

interface MetricItemProps {
  label: string
  value: string
  alert?: boolean
}

function MetricItem({ label, value, alert }: MetricItemProps) {
  return (
    <div>
      <h4 className="font-medium text-gray-600">{label}</h4>
      <p className={`text-2xl font-bold ${alert ? 'text-red-600' : ''}`}>
        {value}
      </p>
    </div>
  )
}

interface AlertMessageProps {
  message: string
  onClose: () => void
}

function AlertMessage({ message, onClose }: AlertMessageProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
      <p>{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-red-700 hover:text-red-900"
      >
        ×
      </button>
    </div>
  )
}
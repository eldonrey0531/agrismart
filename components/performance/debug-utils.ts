import type { PerformanceMetrics } from '@/components/performance/animation-monitor'

/**
 * Performance snapshot structure
 */
export interface PerformanceSnapshot {
  timestamp: string
  metrics: PerformanceMetrics
  history: PerformanceMetrics[]
  environment: {
    userAgent: string
    screen: {
      width: number
      height: number
      pixelRatio: number
    }
    memory?: {
      jsHeapSizeLimit: number
      totalJSHeapSize: number
      usedJSHeapSize: number
    }
  }
}

/**
 * Create performance snapshot
 */
export function createSnapshot(
  metrics: PerformanceMetrics,
  history: PerformanceMetrics[]
): PerformanceSnapshot {
  return {
    timestamp: new Date().toISOString(),
    metrics,
    history,
    environment: {
      userAgent: navigator.userAgent,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
      },
      memory: (performance as any).memory
    }
  }
}

/**
 * Export formats
 */
export type ExportFormat = 'json' | 'csv' | 'html'

/**
 * Export performance data
 */
export async function exportPerformanceData(
  snapshot: PerformanceSnapshot,
  format: ExportFormat = 'json'
): Promise<string> {
  switch (format) {
    case 'json':
      return JSON.stringify(snapshot, null, 2)
    
    case 'csv':
      return convertToCSV(snapshot)
    
    case 'html':
      return generateHTMLReport(snapshot)
    
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Convert snapshot to CSV
 */
function convertToCSV(snapshot: PerformanceSnapshot): string {
  const headers = [
    'Timestamp',
    'FPS',
    'Frame Time',
    'Jank',
    'Dropped Frames',
    'Total Frames'
  ]

  const rows = snapshot.history.map(metrics => [
    new Date().toISOString(),
    metrics.fps,
    metrics.frameTime,
    metrics.jank,
    metrics.dropped,
    metrics.totalFrames
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
}

/**
 * Generate HTML report
 */
function generateHTMLReport(snapshot: PerformanceSnapshot): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Report - ${snapshot.timestamp}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
    .metric { margin-bottom: 1rem; }
    .chart { margin: 2rem 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #eee; }
    .environment { background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Performance Report</h1>
    <p>Generated: ${snapshot.timestamp}</p>

    <h2>Current Metrics</h2>
    <div class="metric">
      <strong>FPS:</strong> ${snapshot.metrics.fps}<br>
      <strong>Frame Time:</strong> ${snapshot.metrics.frameTime}ms<br>
      <strong>Jank:</strong> ${snapshot.metrics.jank} frames<br>
      <strong>Dropped Frames:</strong> ${snapshot.metrics.dropped}<br>
      <strong>Total Frames:</strong> ${snapshot.metrics.totalFrames}
    </div>

    <h2>History</h2>
    <table>
      <thead>
        <tr>
          <th>FPS</th>
          <th>Frame Time</th>
          <th>Jank</th>
          <th>Dropped</th>
        </tr>
      </thead>
      <tbody>
        ${snapshot.history.map(m => `
          <tr>
            <td>${m.fps}</td>
            <td>${m.frameTime}ms</td>
            <td>${m.jank}</td>
            <td>${m.dropped}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Environment</h2>
    <div class="environment">
      <strong>User Agent:</strong> ${snapshot.environment.userAgent}<br>
      <strong>Screen:</strong> ${snapshot.environment.screen.width}x${snapshot.environment.screen.height} (${snapshot.environment.screen.pixelRatio}x)<br>
      ${snapshot.environment.memory ? `
        <strong>Memory:</strong><br>
        JS Heap Size Limit: ${formatBytes(snapshot.environment.memory.jsHeapSizeLimit)}<br>
        Total JS Heap Size: ${formatBytes(snapshot.environment.memory.totalJSHeapSize)}<br>
        Used JS Heap Size: ${formatBytes(snapshot.environment.memory.usedJSHeapSize)}
      ` : ''}
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  
  while (value > 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  
  return `${value.toFixed(2)} ${units[unit]}`
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
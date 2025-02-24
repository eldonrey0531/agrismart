import { useState, useEffect } from 'react'
import type { StoredSnapshot } from '@/lib/utils/snapshot-storage'
import type { ExportFormat, ExportOptions } from './export-types'
import { getFormatConfig } from './export-types'

interface ExportPreviewProps {
  snapshots: StoredSnapshot[]
  format: ExportFormat
  options: ExportOptions
  className?: string
  maxPreviewSize?: number
}

/**
 * Export data preview component
 */
export function ExportPreview({
  snapshots,
  format,
  options,
  className = '',
  maxPreviewSize = 5000
}: ExportPreviewProps) {
  const [preview, setPreview] = useState<string>('')
  const [isTruncated, setIsTruncated] = useState(false)
  const [previewSize, setPreviewSize] = useState<number>(0)

  useEffect(() => {
    generatePreview()
  }, [snapshots, format, options])

  /**
   * Generate preview data
   */
  const generatePreview = () => {
    try {
      let data = ''

      switch (format) {
        case 'json':
          data = generateJsonPreview()
          break
        case 'csv':
          data = generateCsvPreview()
          break
        case 'html':
          data = generateHtmlPreview()
          break
      }

      // Calculate size
      const size = new Blob([data]).size
      setPreviewSize(size)

      // Truncate if needed
      if (data.length > maxPreviewSize) {
        setIsTruncated(true)
        data = data.slice(0, maxPreviewSize) + '\n... (truncated)'
      } else {
        setIsTruncated(false)
      }

      setPreview(data)
    } catch (error) {
      console.error('Preview generation failed:', error)
      setPreview('Error generating preview')
    }
  }

  /**
   * Generate JSON preview
   */
  const generateJsonPreview = (): string => {
    const data = snapshots.map(snapshot => {
      const filtered: Partial<StoredSnapshot> = {
        id: snapshot.id,
        timestamp: snapshot.timestamp
      }

      if (options.includeMetadata) {
        filtered.label = snapshot.label
        filtered.tags = snapshot.tags
      }

      if (options.includeHistory) {
        filtered.history = snapshot.history
      }

      if (options.includeEnvironment) {
        filtered.environment = snapshot.environment
      }

      return filtered
    })

    return options.prettyPrint
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data)
  }

  /**
   * Generate CSV preview
   */
  const generateCsvPreview = (): string => {
    const headers = ['ID', 'Timestamp', 'FPS', 'Frame Time', 'Jank', 'Dropped']
    if (options.includeMetadata) {
      headers.push('Label', 'Tags')
    }
    if (options.includeEnvironment) {
      headers.push('Screen Size', 'Device Pixel Ratio')
    }

    const rows = snapshots.map(snapshot => {
      const row = [
        snapshot.id,
        snapshot.timestamp,
        snapshot.metrics.fps.toString(),
        snapshot.metrics.frameTime.toString(),
        snapshot.metrics.jank.toString(),
        snapshot.metrics.dropped.toString()
      ]

      if (options.includeMetadata) {
        row.push(
          snapshot.label || '',
          (snapshot.tags || []).join(';')
        )
      }

      if (options.includeEnvironment) {
        row.push(
          `${snapshot.environment.screen.width}x${snapshot.environment.screen.height}`,
          snapshot.environment.screen.pixelRatio.toString()
        )
      }

      return row.join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  /**
   * Generate HTML preview
   */
  const generateHtmlPreview = (): string => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Performance Report</title>
  <style>
    body { font-family: system-ui; padding: 2rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    .metric { margin-bottom: 1rem; }
    .tag { background: #e5e7eb; padding: 2px 6px; border-radius: 9999px; }
  </style>
</head>
<body>
  <h1>Performance Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  ${snapshots.map(snapshot => `
    <div class="snapshot">
      <h2>${snapshot.label || 'Unnamed Snapshot'}</h2>
      <p>Recorded: ${new Date(snapshot.timestamp).toLocaleString()}</p>
      
      ${options.includeMetadata ? `
        <div class="tags">
          ${(snapshot.tags || []).map(tag => 
            `<span class="tag">${tag}</span>`
          ).join(' ')}
        </div>
      ` : ''}
      
      <div class="metrics">
        <h3>Performance Metrics</h3>
        <div class="metric">FPS: ${snapshot.metrics.fps}</div>
        <div class="metric">Frame Time: ${snapshot.metrics.frameTime}ms</div>
        <div class="metric">Jank: ${snapshot.metrics.jank} frames</div>
        <div class="metric">Dropped: ${snapshot.metrics.dropped} frames</div>
      </div>

      ${options.includeEnvironment ? `
        <div class="environment">
          <h3>Environment</h3>
          <div>Screen: ${snapshot.environment.screen.width}x${snapshot.environment.screen.height}</div>
          <div>Pixel Ratio: ${snapshot.environment.screen.pixelRatio}</div>
        </div>
      ` : ''}
    </div>
  `).join('\n')}
</body>
</html>`
  }

  const formatConfig = getFormatConfig(format)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          Preview ({formatConfig.label})
        </h3>
        <div className="text-sm text-gray-500">
          {isTruncated ? 'Preview truncated · ' : ''}
          Size: {formatFileSize(previewSize)}
        </div>
      </div>

      <div className="relative">
        <pre className="
          overflow-auto max-h-96 p-4 rounded-lg
          bg-gray-50 font-mono text-sm
        ">
          {preview}
        </pre>

        {isTruncated && (
          <div className="
            absolute bottom-0 left-0 right-0
            h-12 bg-gradient-to-t from-gray-50
          "/>
        )}
      </div>
    </div>
  )
}

/**
 * Format file size in bytes to human readable string
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
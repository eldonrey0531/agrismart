import { useState } from 'react'

export interface ExportButtonProps {
  onExport: () => Promise<string>
  disabled?: boolean
  className?: string
  label?: string
  filename?: string
}

/**
 * Export button with loading state
 */
export function ExportButton({
  onExport,
  disabled = false,
  className = '',
  label = 'Export',
  filename = 'performance-report'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting || disabled) return

    try {
      setIsExporting(true)
      const data = await onExport()
      
      // Create download
      const timestamp = new Date().toISOString().replace(/[:]/g, '-')
      const blob = new Blob([data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      link.href = url
      link.download = `${filename}-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      // You might want to show a toast/notification here
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || disabled}
      className={`
        px-3 py-1.5 rounded
        ${isExporting || disabled 
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600'
        }
        text-white text-sm font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-400
        ${className}
      `}
    >
      <span className="flex items-center space-x-2">
        {isExporting ? (
          <>
            <LoadingSpinner />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <ExportIcon />
            <span>{label}</span>
          </>
        )}
      </span>
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-4 w-4" 
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg 
      className="h-4 w-4" 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path 
        fillRule="evenodd" 
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
        clipRule="evenodd" 
      />
    </svg>
  )
}

/**
 * Example usage:
 * ```tsx
 * function ExportSection() {
 *   return (
 *     <ExportButton
 *       onExport={async () => {
 *         const data = await fetchExportData()
 *         return JSON.stringify(data, null, 2)
 *       }}
 *       label="Export Report"
 *       filename="performance-analysis"
 *     />
 *   )
 * }
 * ```
 */
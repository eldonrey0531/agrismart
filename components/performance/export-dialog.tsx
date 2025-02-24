import { useState } from 'react'
import type { StoredSnapshot } from '@/lib/utils/snapshot-storage'
import { 
  type ExportFormat, 
  type ExportOptions,
  EXPORT_FORMATS,
  DEFAULT_EXPORT_OPTIONS,
  getFormatConfig
} from './export-types'
import { ExportPreview } from './export-preview'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: ExportFormat, options: ExportOptions) => Promise<void>
  snapshots: StoredSnapshot[]
  className?: string
}

/**
 * Export configuration dialog
 */
export function ExportDialog({
  isOpen,
  onClose,
  onExport,
  snapshots,
  className = ''
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('json')
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS)
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await onExport(format, options)
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      // You might want to show a toast/notification here
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        bg-white rounded-lg shadow-xl
        w-full max-w-lg p-6 space-y-6
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Export Performance Data
          </h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-4">
          <label className="block font-medium">Export Format</label>
          <div className="grid gap-3">
            {EXPORT_FORMATS.map(({ value, label, description }) => (
              <label
                key={value}
                className={`
                  flex items-start p-3 rounded-lg border cursor-pointer
                  ${format === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                <input
                  type="radio"
                  name="format"
                  value={value}
                  checked={format === value}
                  onChange={e => setFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div className="ml-3">
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-500">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <label className="block font-medium">Options</label>
          <div className="space-y-2">
            <OptionCheckbox
              label="Include metadata"
              checked={options.includeMetadata}
              onChange={checked => setOptions(prev => ({
                ...prev,
                includeMetadata: checked
              }))}
            />

            <OptionCheckbox
              label="Include performance history"
              checked={options.includeHistory}
              onChange={checked => setOptions(prev => ({
                ...prev,
                includeHistory: checked
              }))}
            />

            <OptionCheckbox
              label="Include environment data"
              checked={options.includeEnvironment}
              onChange={checked => setOptions(prev => ({
                ...prev,
                includeEnvironment: checked
              }))}
            />

            <OptionCheckbox
              label="Pretty print output"
              checked={options.prettyPrint}
              onChange={checked => setOptions(prev => ({
                ...prev,
                prettyPrint: checked
              }))}
            />
          </div>
        </div>

        {/* Preview */}
        <div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          {showPreview && (
            <ExportPreview
              snapshots={snapshots}
              format={format}
              options={options}
              className="mt-4"
            />
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded p-3 text-sm">
          <div className="font-medium">Export Summary</div>
          <div className="text-gray-600">
            {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} selected
          </div>
          <div className="text-gray-600">
            Format: {getFormatConfig(format).label}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className={`
              px-4 py-2 rounded
              ${isExporting
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`
              px-4 py-2 rounded text-white
              ${isExporting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            {isExporting ? <LoadingSpinner /> : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface OptionCheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function OptionCheckbox({ label, checked, onChange }: OptionCheckboxProps) {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="rounded border-gray-300"
      />
      <span className="ml-2">{label}</span>
    </label>
  )
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center space-x-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
      <span>Exporting...</span>
    </div>
  )
}
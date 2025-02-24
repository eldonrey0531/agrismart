/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv' | 'html'

/**
 * Export configuration options
 */
export interface ExportOptions {
  includeMetadata: boolean
  includeHistory: boolean
  includeEnvironment: boolean
  prettyPrint: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * Export format configuration
 */
export interface ExportFormatConfig {
  value: ExportFormat
  label: string
  description: string
  mimeType: string
  extension: string
}

/**
 * Available export formats
 */
export const EXPORT_FORMATS: ExportFormatConfig[] = [
  {
    value: 'json',
    label: 'JSON',
    description: 'Complete data in JSON format',
    mimeType: 'application/json',
    extension: 'json'
  },
  {
    value: 'csv',
    label: 'CSV',
    description: 'Tabular data for spreadsheets',
    mimeType: 'text/csv',
    extension: 'csv'
  },
  {
    value: 'html',
    label: 'HTML Report',
    description: 'Formatted HTML report',
    mimeType: 'text/html',
    extension: 'html'
  }
]

/**
 * Default export options
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeMetadata: true,
  includeHistory: true,
  includeEnvironment: true,
  prettyPrint: true
}

/**
 * Get format configuration
 */
export function getFormatConfig(format: ExportFormat): ExportFormatConfig {
  const config = EXPORT_FORMATS.find(f => f.value === format)
  if (!config) {
    throw new Error(`Invalid export format: ${format}`)
  }
  return config
}
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  isToday,
  isYesterday,
  parseISO,
  formatDistanceToNow
} from 'date-fns'

// Import local types
import type {
  DateRange,
  UIVariant,
  Severity,
  DateInput,
  TimeFormatOptions,
  DateRangeFormatOptions,
  ClassValue
} from '@/types/ui'

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date or date range for display
 */
export function formatDateRange(
  range: DateRange | undefined,
  options: DateRangeFormatOptions = {}
): string {
  const {
    format: formatStr = 'LLL dd, y',
    separator = ' - ',
    includeTime = false
  } = options

  if (!range?.from) return 'Pick a date range'
  
  const fromStr = formatDateTime(range.from, { format: formatStr, includeTime })
  if (!range.to) return fromStr
  
  const toStr = formatDateTime(range.to, { format: formatStr, includeTime })
  return `${fromStr}${separator}${toStr}`
}

/**
 * Get variant for severity level
 */
export function getVariant(severity: Severity): UIVariant {
  switch (severity) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    default:
      return 'default'
  }
}

/**
 * Parse date input to Date object safely
 */
function parseDateInput(date: DateInput): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  if (typeof date === 'string') {
    try {
      return parseISO(date)
    } catch {
      return null
    }
  }
  const parsed = new Date(date)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Format a date consistently
 */
export function formatDateTime(
  date: DateInput,
  options: TimeFormatOptions = {}
): string {
  const parsedDate = parseDateInput(date)
  if (!parsedDate) return ''
  
  const {
    format: formatStr = 'PPP',
    includeTime = false,
    addSuffix = false
  } = options

  try {
    let result = format(parsedDate, formatStr)
    if (includeTime) {
      result += ` ${format(parsedDate, 'h:mm a')}`
    }
    if (addSuffix) {
      result = formatDistanceToNow(parsedDate, { addSuffix: true })
    }
    return result
  } catch {
    return ''
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: DateInput): string {
  const parsedDate = parseDateInput(date)
  if (!parsedDate) return ''
  
  try {
    if (isToday(parsedDate)) {
      return formatDistanceToNow(parsedDate, { addSuffix: true })
    }
    if (isYesterday(parsedDate)) {
      return 'Yesterday'
    }
    return formatDateTime(parsedDate)
  } catch {
    return ''
  }
}

/**
 * Get appropriate time format based on date
 */
export function getTimeFormat(date: DateInput): string {
  const parsedDate = parseDateInput(date)
  if (!parsedDate) return ''
  
  try {
    if (isToday(parsedDate)) {
      return formatDistanceToNow(parsedDate, { addSuffix: true })
    }
    if (isYesterday(parsedDate)) {
      return `Yesterday at ${format(parsedDate, 'h:mm a')}`
    }
    return formatDateTime(parsedDate, { includeTime: true })
  } catch {
    return ''
  }
}

// Export date formatting functions
export {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO
}
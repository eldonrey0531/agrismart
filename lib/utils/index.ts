// String utils
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

// Date utils
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export function relativeTime(date: Date, locales = 'en'): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime() // Reversed the subtraction
  const diffMin = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7))
  const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30))

  const rtf = new Intl.RelativeTimeFormat(locales, { numeric: 'auto' })

  // Use positive values for "ago" format
  if (diffMin < 60) {
    return rtf.format(-diffMin, 'minute')
  }
  if (diffHours < 24) {
    return rtf.format(-diffHours, 'hour')
  }
  if (diffDays < 7) {
    return rtf.format(-diffDays, 'day')
  }
  if (diffWeeks < 4) {
    return rtf.format(-diffWeeks, 'week')
  }
  return rtf.format(-diffMonths, 'month')
}

// URL utils
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

// Array utils
export function groupByDate<T extends { timestamp: Date }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const date = item.timestamp.toDateString()
    return {
      ...groups,
      [date]: [...(groups[date] || []), item]
    }
  }, {} as Record<string, T[]>)
}

// Async utils
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Date checks
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
}
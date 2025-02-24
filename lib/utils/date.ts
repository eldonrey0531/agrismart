export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export function relativeTime(date: Date, locales = 'en'): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.round(diffMs / (1000 * 60 * 60 * 24 * 7))
  const diffMonths = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30))

  const rtf = new Intl.RelativeTimeFormat(locales, { numeric: 'auto' })

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

export function groupByDate<T extends { timestamp: Date }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups: Record<string, T[]>, item) => {
    const dateStr = item.timestamp.toISOString().split('T')[0]
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(item)
    return groups
  }, {})
}

export function formatDateHeading(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}
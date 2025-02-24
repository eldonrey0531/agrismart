declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: { [key: string]: any }): string
  export function formatDistanceToNow(date: Date | number, options?: { addSuffix?: boolean }): string
  export function isToday(date: Date | number): boolean
  export function isYesterday(date: Date | number): boolean
  export function parseISO(dateString: string): Date
  export function isValid(date: any): boolean
  export function parse(dateString: string, formatString: string, baseDate: Date, options?: { [key: string]: any }): Date
  export function addDays(date: Date | number, amount: number): Date
  export function subDays(date: Date | number, amount: number): Date
  export function startOfDay(date: Date | number): Date
  export function endOfDay(date: Date | number): Date
  export function isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number
  export function differenceInHours(dateLeft: Date | number, dateRight: Date | number): number
  export function differenceInMinutes(dateLeft: Date | number, dateRight: Date | number): number
}

declare module 'date-fns/*' {
  export * from 'date-fns'
}
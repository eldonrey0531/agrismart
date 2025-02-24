declare module 'errors' {
  export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info'

  export interface BaseError {
    code: string
    message: string
    severity: ErrorSeverity
    timestamp: number
    context?: Record<string, unknown>
    retryAttempt?: number
  }

  export interface AlertError extends BaseError {
    channel: string
    target: string
    retry?: {
      count: number
      maxRetries: number
      nextRetry: number
    }
  }

  export interface ValidationError extends BaseError {
    field: string
    value: unknown
    constraint: string
  }

  export interface ThresholdError extends BaseError {
    metric: string
    current: number
    threshold: number
    percentage: number
  }

  export interface NetworkError extends BaseError {
    url: string
    status?: number
    responseTime?: number
    retryAfter?: number
  }

  export type PerformanceError =
    | AlertError
    | ValidationError
    | ThresholdError
    | NetworkError

  export interface RetryOptions {
    attempt: number
    maxRetries: number
    error: BaseError
  }

  export interface ErrorHandler<T extends BaseError = PerformanceError> {
    handle(error: T): Promise<void>
    shouldRetry(error: T, attempt: number): boolean
    getRetryDelay(error: T, attempt: number): number
    onRetry?(options: RetryOptions): void
  }

  export interface ErrorReporter {
    report(error: PerformanceError): Promise<void>
    batchReport(errors: PerformanceError[]): Promise<void>
    getStats(): ErrorStats
    clear(): void
  }

  export interface ErrorStats {
    total: number
    bySeverity: Record<ErrorSeverity, number>
    byCode: Record<string, number>
    lastError?: PerformanceError
    errorRate: number
    timeRange: {
      start: number
      end: number
    }
  }

  export interface RetryPolicy {
    maxRetries: number
    baseDelay: number
    maxDelay: number
    factor: number
    shouldRetry(error: PerformanceError, attempt: number): boolean
    getDelay(attempt: number): number
  }

  export interface ErrorFactory {
    createAlertError(params: Omit<AlertError, 'timestamp' | 'severity'>): AlertError
    createValidationError(params: Omit<ValidationError, 'timestamp' | 'severity'>): ValidationError
    createThresholdError(params: Omit<ThresholdError, 'timestamp' | 'severity'>): ThresholdError
    createNetworkError(params: Omit<NetworkError, 'timestamp' | 'severity'>): NetworkError
  }

  export interface ErrorFilter {
    bySeverity(severity: ErrorSeverity): PerformanceError[]
    byTimeRange(start: Date, end: Date): PerformanceError[]
    byCode(code: string): PerformanceError[]
    byContext(key: string, value: unknown): PerformanceError[]
  }

  export interface ErrorSerializer {
    serialize(error: PerformanceError): string
    deserialize(data: string): PerformanceError
    format(error: PerformanceError, format: 'json' | 'text' | 'html'): string
  }
}
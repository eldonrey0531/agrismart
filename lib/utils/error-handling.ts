import type {
  PerformanceError,
  ErrorSeverity,
  AlertError,
  ValidationError,
  ThresholdError,
  NetworkError,
  RetryPolicy,
  ErrorStats,
  ErrorFactory,
  ErrorHandler,
  ErrorReporter,
  RetryOptions
} from 'errors'

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  factor: 2,
  shouldRetry(error: PerformanceError, attempt: number): boolean {
    // Don't retry validation errors
    if ('field' in error) return false
    
    // Always retry network errors with retry-after
    if ('retryAfter' in error) return true
    
    // Don't retry on max attempts
    if (attempt >= this.maxRetries) return false
    
    // Retry based on severity
    return error.severity !== 'fatal'
  },
  getDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(this.factor, attempt - 1)
    return Math.min(delay, this.maxDelay)
  }
}

/**
 * Error factory for creating typed errors
 */
export const errorFactory: ErrorFactory = {
  createAlertError(params): AlertError {
    return {
      ...params,
      severity: 'error',
      timestamp: Date.now()
    }
  },
  
  createValidationError(params): ValidationError {
    return {
      ...params,
      severity: 'warning',
      timestamp: Date.now()
    }
  },
  
  createThresholdError(params): ThresholdError {
    return {
      ...params,
      severity: 'error',
      timestamp: Date.now()
    }
  },
  
  createNetworkError(params): NetworkError {
    return {
      ...params,
      severity: 'error',
      timestamp: Date.now()
    }
  }
}

/**
 * Base error handler with retry logic
 */
export class BaseErrorHandler implements ErrorHandler<PerformanceError> {
  constructor(
    private readonly retryPolicy: RetryPolicy = DEFAULT_RETRY_POLICY,
    private readonly reporter?: ErrorReporter
  ) {}

  async handle(error: PerformanceError): Promise<void> {
    let attempt = 1
    
    while (attempt <= this.retryPolicy.maxRetries) {
      try {
        await this.handleError(error)
        return
      } catch (retryError) {
        if (!this.shouldRetry(error, attempt) || attempt === this.retryPolicy.maxRetries) {
          throw retryError
        }
        
        const delay = this.getRetryDelay(error, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        this.onRetry?.({
          attempt,
          maxRetries: this.retryPolicy.maxRetries,
          error: { ...error, retryAttempt: attempt }
        })
        
        attempt++
      }
    }
  }

  shouldRetry(error: PerformanceError, attempt: number): boolean {
    return this.retryPolicy.shouldRetry(error, attempt)
  }

  getRetryDelay(error: PerformanceError, attempt: number): number {
    if ('retryAfter' in error && error.retryAfter) {
      return error.retryAfter * 1000
    }
    return this.retryPolicy.getDelay(attempt)
  }

  onRetry(options: RetryOptions): void {
    console.warn(
      `Retrying error ${options.error.code} (attempt ${options.attempt}/${options.maxRetries})`
    )
  }

  protected async handleError(error: PerformanceError): Promise<void> {
    await this.reporter?.report(error)
    console.error(
      `[${error.severity.toUpperCase()}] ${error.code}: ${error.message}`,
      error.context
    )
  }
}

/**
 * Performance error reporter
 */
export class PerformanceErrorReporter implements ErrorReporter {
  private errors: PerformanceError[] = []
  private readonly startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  async report(error: PerformanceError): Promise<void> {
    this.errors.push(error)
  }

  async batchReport(errors: PerformanceError[]): Promise<void> {
    this.errors.push(...errors)
  }

  clear(): void {
    this.errors = []
  }

  getStats(): ErrorStats {
    const total = this.errors.length
    const now = Date.now()
    const timeRange = (now - this.startTime) / 1000 // seconds

    const bySeverity = this.errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<ErrorSeverity, number>)

    const byCode = this.errors.reduce((acc, error) => {
      acc[error.code] = (acc[error.code] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      bySeverity,
      byCode,
      lastError: this.errors[this.errors.length - 1],
      errorRate: total / timeRange,
      timeRange: {
        start: this.startTime,
        end: now
      }
    }
  }
}

/**
 * Error filter implementation
 */
export class ErrorFilter {
  constructor(private errors: PerformanceError[]) {}

  bySeverity(severity: ErrorSeverity): PerformanceError[] {
    return this.errors.filter(error => error.severity === severity)
  }

  byTimeRange(start: Date, end: Date): PerformanceError[] {
    return this.errors.filter(error => 
      error.timestamp >= start.getTime() && error.timestamp <= end.getTime()
    )
  }

  byCode(code: string): PerformanceError[] {
    return this.errors.filter(error => error.code === code)
  }

  byContext(key: string, value: unknown): PerformanceError[] {
    return this.errors.filter(error => 
      error.context?.[key] === value
    )
  }
}

/**
 * Utility functions
 */
export function isRetryableError(error: PerformanceError, attempt: number): boolean {
  return DEFAULT_RETRY_POLICY.shouldRetry(error, attempt)
}

export function getErrorSeverity(error: PerformanceError): ErrorSeverity {
  if ('field' in error) return 'warning'
  if ('retryAfter' in error) return 'error'
  if ('threshold' in error) return 'error'
  return error.severity
}

export function formatError(error: PerformanceError): string {
  const severity = error.severity.toUpperCase()
  const timestamp = new Date(error.timestamp).toISOString()
  const attempt = error.retryAttempt ? ` (Attempt ${error.retryAttempt})` : ''
  
  let details = ''
  if ('field' in error) {
    details = `Field: ${error.field}, Value: ${error.value}`
  } else if ('threshold' in error) {
    details = `Metric: ${error.metric}, Current: ${error.current}, Threshold: ${error.threshold}`
  } else if ('url' in error) {
    details = `URL: ${error.url}${error.status ? `, Status: ${error.status}` : ''}`
  }

  return `[${severity}] ${timestamp}${attempt} - ${error.code}: ${error.message}${details ? ` (${details})` : ''}`
}

/**
 * Example usage:
 * ```typescript
 * const handler = new BaseErrorHandler(DEFAULT_RETRY_POLICY)
 * const reporter = new PerformanceErrorReporter()
 * 
 * try {
 *   // Some operation
 * } catch (error) {
 *   const perfError = errorFactory.createThresholdError({
 *     code: 'PERF_THRESHOLD_EXCEEDED',
 *     message: 'Performance threshold exceeded',
 *     metric: 'fps',
 *     current: 30,
 *     threshold: 60,
 *     percentage: 50
 *   })
 *   
 *   await handler.handle(perfError)
 * }
 * ```
 */
import type { BenchmarkResult, StatisticalAnalysis } from '@/types/benchmark'

/**
 * Performance analysis class
 */
class PerformanceAnalyzer {
  /**
   * Validate benchmark result
   */
  validateBenchmark(result: BenchmarkResult): void {
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid benchmark result')
    }

    if (!Array.isArray(result.samples) || result.samples.length === 0) {
      throw new Error('Benchmark must contain samples')
    }

    if (!result.samples.every(s => typeof s === 'number' && !isNaN(s))) {
      throw new Error('All samples must be valid numbers')
    }

    if (typeof result.meanTime !== 'number' || isNaN(result.meanTime)) {
      throw new Error('Invalid mean time')
    }

    if (typeof result.opsPerSecond !== 'number' || isNaN(result.opsPerSecond)) {
      throw new Error('Invalid operations per second')
    }
  }

  /**
   * Check for performance regression
   */
  checkRegression(
    current: BenchmarkResult,
    baseline: BenchmarkResult,
    threshold = 0.1 // 10% threshold
  ): void {
    this.validateBenchmark(current)
    this.validateBenchmark(baseline)

    const percentChange = (current.meanTime - baseline.meanTime) / baseline.meanTime

    if (percentChange > threshold) {
      throw new Error(
        `Performance regression detected: ${(percentChange * 100).toFixed(2)}% slower`
      )
    }
  }

  /**
   * Analyze benchmark results
   */
  analyzeBenchmark(result: BenchmarkResult): StatisticalAnalysis {
    this.validateBenchmark(result)

    const samples = result.samples
    const mean = result.meanTime
    const n = samples.length

    // Calculate standard deviation
    const variance = samples.reduce(
      (acc, s) => acc + Math.pow(s - mean, 2), 
      0
    ) / n
    const stdDev = Math.sqrt(variance)

    // Calculate confidence interval (95%)
    const criticalValue = 1.96 // For 95% confidence
    const margin = criticalValue * (stdDev / Math.sqrt(n))
    const confidenceInterval: [number, number] = [
      mean - margin,
      mean + margin
    ]

    // Detect outliers (1.5 IQR)
    const sorted = [...samples].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(n * 0.25)]
    const q3 = sorted[Math.floor(n * 0.75)]
    const iqr = q3 - q1
    const outliers = samples.filter(
      s => s < q1 - 1.5 * iqr || s > q3 + 1.5 * iqr
    )

    return {
      mean,
      median: sorted[Math.floor(n / 2)],
      stdDev,
      confidenceInterval,
      outliers,
      sampleSize: n,
      isSignificant: outliers.length > 0,
      pValue: this.calculatePValue(samples),
      effectSize: this.calculateEffectSize(samples)
    }
  }

  /**
   * Calculate p-value (simplified)
   */
  protected calculatePValue(samples: number[]): number {
    const n = samples.length
    if (n < 2) return 1

    const mean = samples.reduce((a, b) => a + b) / n
    const variance = samples.reduce(
      (acc, s) => acc + Math.pow(s - mean, 2),
      0
    ) / (n - 1)

    // Simple t-test approximation
    const t = Math.abs(mean) / Math.sqrt(variance / n)
    const df = n - 1

    // Approximation of p-value
    return 2 * (1 - this.tCDF(t, df))
  }

  /**
   * Calculate effect size (Cohen's d)
   */
  protected calculateEffectSize(samples: number[]): number {
    const n = samples.length
    if (n < 2) return 0

    const mean = samples.reduce((a, b) => a + b) / n
    const variance = samples.reduce(
      (acc, s) => acc + Math.pow(s - mean, 2),
      0
    ) / (n - 1)

    return Math.abs(mean) / Math.sqrt(variance)
  }

  /**
   * Student's t cumulative distribution function approximation
   */
  protected tCDF(t: number, df: number): number {
    const x = df / (df + t * t)
    let result = 1
    for (let j = df - 2; j >= 2; j -= 2) {
      result = 1 + (j - 1) * x * result / (2 * j)
    }
    return 1 - 0.5 * Math.sqrt(1 - x) * result
  }
}

// Create singleton instance
const analyzer = new PerformanceAnalyzer()

/**
 * Export performance utilities
 */
export const performance = {
  validateBenchmark: analyzer.validateBenchmark.bind(analyzer),
  checkRegression: analyzer.checkRegression.bind(analyzer),
  analyzeBenchmark: analyzer.analyzeBenchmark.bind(analyzer)
}

/**
 * Export assertion helpers
 */
export const assertions = {
  validBenchmark: performance.validateBenchmark,
  noRegression: performance.checkRegression
}
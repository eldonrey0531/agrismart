/**
 * Benchmark sample data and results
 */
export interface BenchmarkSample {
  samples: number[]
  name: string
}

export interface BenchmarkResult extends BenchmarkSample {
  meanTime: number
  opsPerSecond: number
  margin: number
}

/**
 * Statistical analysis interfaces
 */
export interface ConfidenceInterval {
  lower: number
  upper: number
}

export interface StatisticalAnalysis {
  mean: number
  median: number
  stdDev: number
  confidenceInterval: [number, number]
  outliers: number[]
  isSignificant: boolean
  pValue: number
  effectSize: number
  sampleSize: number
}

export interface ComparisonResult {
  pValue: number
  effectSize: number
  isSignificant: boolean
}

export type ConfidenceLevel = 0.90 | 0.95 | 0.99

export const CONFIDENCE_LEVELS: Record<string, ConfidenceLevel> = {
  LOW: 0.90,    // 90%
  MEDIUM: 0.95, // 95%
  HIGH: 0.99    // 99%
} as const
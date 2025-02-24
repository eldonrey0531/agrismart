import type { ChartConfiguration, ChartDataset } from 'chart.js'
import type { BenchmarkResult } from '@/types/benchmark'

interface ChartColors {
  primary: string
  secondary: string
  background: string
  border: string
}

const CHART_COLORS: ChartColors = {
  primary: 'rgb(75, 192, 192)',
  secondary: 'rgb(192, 75, 75)',
  background: 'rgba(75, 192, 192, 0.5)',
  border: 'rgb(75, 192, 192)'
}

/**
 * Create timeline chart configuration
 */
export function createTimelineConfig(
  results: BenchmarkResult[],
  baseline?: BenchmarkResult[],
  onClick?: (index: number) => void
): ChartConfiguration {
  return {
    type: 'line',
    data: {
      labels: results.map(r => r.name),
      datasets: createTimelineDatasets(results, baseline)
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: 'Performance Timeline'
        },
        tooltip: {
          enabled: true
        }
      },
      onClick: onClick ? (_, elements) => {
        if (elements.length > 0) {
          onClick(elements[0].index)
        }
      } : undefined
    }
  }
}

/**
 * Create distribution chart configuration
 */
export function createDistributionConfig(
  result: BenchmarkResult
): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels: result.samples.map((_, i) => `Sample ${i + 1}`),
      datasets: [{
        label: 'Sample Time (ms)',
        data: result.samples,
        backgroundColor: CHART_COLORS.background,
        borderColor: CHART_COLORS.border,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Sample Distribution'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Time (ms)'
          }
        }
      }
    }
  }
}

/**
 * Create metrics chart configuration
 */
export function createMetricsConfig(
  analysis: {
    mean: number
    median: number
    stdDev: number
    outliers: number[]
  }
): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels: ['Mean', 'Median', 'Std Dev', 'Outliers'],
      datasets: [{
        label: 'Performance Metrics',
        data: [
          analysis.mean,
          analysis.median,
          analysis.stdDev,
          analysis.outliers.length
        ],
        backgroundColor: [
          CHART_COLORS.primary,
          CHART_COLORS.primary,
          CHART_COLORS.secondary,
          analysis.outliers.length > 0 ? CHART_COLORS.secondary : CHART_COLORS.primary
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Statistical Analysis'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }
}

/**
 * Create timeline datasets
 */
function createTimelineDatasets(
  results: BenchmarkResult[],
  baseline?: BenchmarkResult[]
): ChartDataset[] {
  const datasets: ChartDataset[] = [{
    label: 'Mean Time (ms)',
    data: results.map(r => r.meanTime),
    borderColor: CHART_COLORS.primary,
    tension: 0.1
  }]

  if (baseline?.length) {
    datasets.push({
      label: 'Baseline',
      data: results.map(r => 
        baseline.find(b => b.name === r.name)?.meanTime ?? null
      ),
      borderColor: CHART_COLORS.secondary,
      borderDash: [5, 5],
      tension: 0.1
    })
  }

  return datasets
}

/**
 * Create comparison chart configuration
 */
export function createComparisonConfig(
  current: BenchmarkResult,
  baseline: BenchmarkResult
): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels: ['Current', 'Baseline'],
      datasets: [{
        label: 'Mean Time (ms)',
        data: [current.meanTime, baseline.meanTime],
        backgroundColor: [
          CHART_COLORS.primary,
          CHART_COLORS.secondary
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Performance Comparison'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Time (ms)'
          }
        }
      }
    }
  }
}
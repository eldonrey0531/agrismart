import type { 
  ChartConfiguration, 
  ChartAnimationOptions,
  ChartDataset,
  ChartOptions 
} from 'chart.js'

/**
 * Animation presets for performance charts
 */
export const animations: Record<string, ChartAnimationOptions> = {
  /**
   * Smooth fade in animation
   */
  fadeIn: {
    duration: 800,
    easing: 'easeOutQuart',
    delay: 0,
    loop: false
  },

  /**
   * Progressive bar growth
   */
  growBar: {
    duration: 1000,
    easing: 'easeInOutQuart',
    delay(ctx: { dataIndex: number }) {
      return ctx.dataIndex * 100
    }
  },

  /**
   * Line drawing animation
   */
  drawLine: {
    duration: 1500,
    easing: 'easeInOutCubic',
    delay: 0,
    loop: false
  },

  /**
   * Point pop animation
   */
  popPoints: {
    duration: 600,
    easing: 'easeOutElastic',
    delay(ctx: { dataIndex: number }) {
      return ctx.dataIndex * 50
    }
  }
}

/**
 * Apply animation preset to chart configuration
 */
export function applyAnimation(
  config: ChartConfiguration,
  preset: keyof typeof animations
): ChartConfiguration {
  return {
    ...config,
    options: {
      ...config.options,
      animation: animations[preset]
    }
  }
}

/**
 * Create transition between chart states
 */
export function createTransition(
  config: ChartConfiguration,
  options: {
    duration?: number
    easing?: string
    onComplete?: () => void
  } = {}
): ChartConfiguration {
  const {
    duration = 750,
    easing = 'easeInOutQuart',
    onComplete
  } = options

  const animationOptions: ChartAnimationOptions = {
    duration,
    easing,
    onComplete: onComplete 
      ? (animation: { initial: boolean }) => {
          if (animation.initial) {
            onComplete()
          }
        }
      : undefined
  }

  return {
    ...config,
    options: {
      ...config.options,
      transitions: {
        active: {
          animation: animationOptions
        }
      },
      animation: animationOptions
    }
  }
}

/**
 * Create hover effects
 */
export function createHoverEffects(
  config: ChartConfiguration
): ChartConfiguration {
  const enhancedDatasets: ChartDataset[] = config.data.datasets.map(dataset => ({
    ...dataset,
    hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
    hoverBorderColor: 'rgba(75, 192, 192, 1)',
    hoverBorderWidth: 2,
    hoverRadius: 6
  }))

  const enhancedOptions: ChartOptions = {
    ...config.options,
    interaction: {
      mode: 'nearest',
      intersect: true
    },
    animation: {
      duration: 400
    }
  }

  return {
    ...config,
    data: {
      ...config.data,
      datasets: enhancedDatasets
    },
    options: enhancedOptions
  }
}

/**
 * Animation sequences for complex transitions
 */
export const sequences = {
  /**
   * Progressive reveal of data points
   */
  progressiveReveal: (chart: any) => {
    const data = chart.data.datasets[0].data
    let currentIndex = 0

    const animate = () => {
      if (currentIndex < data.length) {
        chart.show(0, currentIndex)
        currentIndex++
        requestAnimationFrame(animate)
      }
    }

    chart.hide(0, data.length - 1)
    requestAnimationFrame(animate)
  },

  /**
   * Cascade update of multiple datasets
   */
  cascadeUpdate: (chart: any, newData: number[][]) => {
    const updateDataset = (index: number) => {
      if (index < chart.data.datasets.length) {
        chart.data.datasets[index].data = newData[index]
        chart.update('active')
        setTimeout(() => updateDataset(index + 1), 200)
      }
    }

    updateDataset(0)
  }
}

/**
 * Chart animation state manager
 */
export class ChartAnimator {
  private chart: any
  private currentAnimation?: number

  constructor(chart: any) {
    this.chart = chart
  }

  /**
   * Start an animation sequence
   */
  start(sequence: (chart: any) => void) {
    this.stop()
    sequence(this.chart)
  }

  /**
   * Stop current animation
   */
  stop() {
    if (this.currentAnimation) {
      cancelAnimationFrame(this.currentAnimation)
      this.currentAnimation = undefined
    }
  }

  /**
   * Apply transition
   */
  transition(options: {
    duration?: number
    easing?: string
    onComplete?: () => void
  } = {}) {
    const animationOptions: ChartAnimationOptions = {
      duration: options.duration || 750,
      easing: options.easing || 'easeInOutQuart',
      onComplete: options.onComplete 
        ? () => options.onComplete?.() 
        : undefined
    }

    this.chart.update({
      duration: animationOptions.duration,
      easing: animationOptions.easing
    })
    
    if (options.onComplete) {
      setTimeout(options.onComplete, options.duration || 750)
    }
  }
}
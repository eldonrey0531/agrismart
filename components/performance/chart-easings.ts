/**
 * Custom easing functions for chart animations
 */
export const easings = {
  /**
   * Elastic bounce
   */
  elasticBounce: (t: number): number => {
    const p = 0.3
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1
  },

  /**
   * Smooth step
   */
  smoothStep: (t: number): number => {
    return t * t * (3 - 2 * t)
  },

  /**
   * Back ease
   */
  backEase: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },

  /**
   * Bounce
   */
  bounce: (t: number): number => {
    if (t < (1 / 2.75)) {
      return 7.5625 * t * t
    } else if (t < (2 / 2.75)) {
      return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75
    } else if (t < (2.5 / 2.75)) {
      return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375
    } else {
      return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375
    }
  },

  /**
   * Spring
   */
  spring: (t: number): number => {
    return 1 - (Math.cos(t * 4.5 * Math.PI) * Math.exp(-t * 6))
  }
}

/**
 * Easing composition helpers
 */
export const easingUtils = {
  /**
   * Compose multiple easing functions
   */
  compose: (...fns: Array<(t: number) => number>) => (t: number) => 
    fns.reduce((acc, fn) => fn(acc), t),

  /**
   * Reverse an easing function
   */
  reverse: (fn: (t: number) => number) => (t: number) => 
    1 - fn(1 - t),

  /**
   * Scale an easing function
   */
  scale: (fn: (t: number) => number, scale: number) => (t: number) => 
    fn(t) * scale,

  /**
   * Add delay to an easing function
   */
  delay: (fn: (t: number) => number, delay: number) => (t: number) => 
    t < delay ? 0 : fn((t - delay) / (1 - delay)),

  /**
   * Create stepped easing
   */
  steps: (steps: number) => (t: number) => 
    Math.floor(t * steps) / steps
}
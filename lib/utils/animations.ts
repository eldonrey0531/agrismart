/**
 * Animation duration values in milliseconds
 */
export const durations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const

/**
 * Timing functions for animations
 */
export const easings = {
  // Standard
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier curves
  snappy: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  bouncy: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

/**
 * Animation keyframes
 */
export const keyframes = {
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)' },
    to: { transform: 'scale(1)' },
  },
  scaleOut: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(0.95)' },
  },
  slideInFromTop: {
    from: { transform: 'translateY(-100%)' },
    to: { transform: 'translateY(0)' },
  },
  slideOutToTop: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(-100%)' },
  },
  slideInFromBottom: {
    from: { transform: 'translateY(100%)' },
    to: { transform: 'translateY(0)' },
  },
  slideOutToBottom: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(100%)' },
  },
} as const

/**
 * Helper function to generate animation styles
 */
export function generateAnimationStyles(options: {
  name: keyof typeof keyframes
  duration?: keyof typeof durations
  easing?: keyof typeof easings
  delay?: number
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}) {
  const {
    name,
    duration = 'normal',
    easing = 'smooth',
    delay = 0,
    fillMode = 'both',
  } = options

  return {
    animation: [
      name,
      `${durations[duration]}ms`,
      easings[easing],
      `${delay}ms`,
      fillMode,
    ].join(' '),
  }
}

/**
 * Predefined animation variants
 */
export const variants = {
  toast: {
    initial: generateAnimationStyles({
      name: 'fadeIn',
      duration: 'fast',
    }),
    exit: generateAnimationStyles({
      name: 'fadeOut',
      duration: 'fast',
    }),
  },
  dialog: {
    overlay: {
      initial: generateAnimationStyles({
        name: 'fadeIn',
        duration: 'normal',
      }),
      exit: generateAnimationStyles({
        name: 'fadeOut',
        duration: 'normal',
      }),
    },
    content: {
      initial: {
        ...generateAnimationStyles({
          name: 'fadeIn',
          duration: 'normal',
        }),
        ...generateAnimationStyles({
          name: 'scaleIn',
          duration: 'normal',
        }),
      },
      exit: {
        ...generateAnimationStyles({
          name: 'fadeOut',
          duration: 'normal',
        }),
        ...generateAnimationStyles({
          name: 'scaleOut',
          duration: 'normal',
        }),
      },
    },
  },
  tooltip: {
    initial: generateAnimationStyles({
      name: 'fadeIn',
      duration: 'fast',
      easing: 'snappy',
    }),
    exit: generateAnimationStyles({
      name: 'fadeOut',
      duration: 'fast',
      easing: 'snappy',
    }),
  },
} as const

/**
 * Animation class names for Tailwind
 */
export const animationClasses = {
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',
  slideIn: 'animate-in slide-in-from-bottom',
  slideOut: 'animate-out slide-out-to-bottom',
  scaleIn: 'animate-in zoom-in',
  scaleOut: 'animate-out zoom-out',
} as const
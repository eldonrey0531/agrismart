import { type ExtendedAnimationOptions } from './animation-system';

interface AnimationDefinition {
  keyframes: Keyframe[];
  options: ExtendedAnimationOptions;
}

// Transform Patterns
export const transformPatterns = {
  fadeIn: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1 },
    ],
    options: {
      duration: 300,
      easing: 'ease-out',
    },
  },
  fadeOut: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 },
    ],
    options: {
      duration: 300,
      easing: 'ease-in',
    },
  },
  slideInUp: {
    keyframes: [
      { transform: 'translateY(20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    options: {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  slideInDown: {
    keyframes: [
      { transform: 'translateY(-20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    options: {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  scaleIn: {
    keyframes: [
      { transform: 'scale(0.95)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    options: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Motion Patterns
export const motionPatterns = {
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-30%)' },
      { transform: 'translateY(0)' },
      { transform: 'translateY(-15%)' },
      { transform: 'translateY(0)' },
      { transform: 'translateY(-7%)' },
      { transform: 'translateY(0)' },
    ],
    options: {
      duration: 1000,
      easing: 'cubic-bezier(0.28, 0.84, 0.42, 1)',
    },
  },
  wave: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(14deg)' },
      { transform: 'rotate(-8deg)' },
      { transform: 'rotate(14deg)' },
      { transform: 'rotate(-4deg)' },
      { transform: 'rotate(10deg)' },
      { transform: 'rotate(0deg)' },
    ],
    options: {
      duration: 2500,
      easing: 'linear',
    },
  },
  spin: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ],
    options: {
      duration: 1000,
      iterations: Infinity,
      easing: 'linear',
    },
  },
};

// Attention Patterns
export const attentionPatterns = {
  pulse: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
    ],
    options: {
      duration: 500,
      easing: 'ease-in-out',
    },
  },
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' },
    ],
    options: {
      duration: 500,
      easing: 'ease-in-out',
    },
  },
  heartbeat: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.2)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1)' },
    ],
    options: {
      duration: 1000,
      easing: 'ease-in-out',
    },
  },
};

// Combined Patterns
export const combinedPatterns = {
  popIn: {
    keyframes: [
      { transform: 'scale(0.5) rotate(-5deg)', opacity: 0 },
      { transform: 'scale(1.1) rotate(2deg)', opacity: 0.7 },
      { transform: 'scale(1) rotate(0)', opacity: 1 },
    ],
    options: {
      duration: 400,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
  flipIn: {
    keyframes: [
      { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
      { transform: 'perspective(400px) rotateX(-20deg)', opacity: 0.5 },
      { transform: 'perspective(400px) rotateX(10deg)', opacity: 0.75 },
      { transform: 'perspective(400px) rotateX(0deg)', opacity: 1 },
    ],
    options: {
      duration: 600,
      easing: 'ease-out',
    },
  },
  swingIn: {
    keyframes: [
      { transform: 'rotateY(-70deg)', opacity: 0 },
      { transform: 'rotateY(20deg)', opacity: 0.5 },
      { transform: 'rotateY(-10deg)', opacity: 0.8 },
      { transform: 'rotateY(0deg)', opacity: 1 },
    ],
    options: {
      duration: 800,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
};

// Helper function to combine patterns
export function combinePatterns(
  patterns: AnimationDefinition[],
  options: Partial<ExtendedAnimationOptions> = {}
): AnimationDefinition {
  let totalDuration = 0;
  const combinedKeyframes: Keyframe[] = [];

  patterns.forEach(({ keyframes, options: patternOptions }) => {
    const duration = Number(patternOptions.duration) || 1000;
    keyframes.forEach((keyframe, index) => {
      const progress = index / (keyframes.length - 1);
      const currentTime = totalDuration + progress * duration;
      const totalTime = patterns.reduce((sum, pattern) => {
        return sum + (Number(pattern.options.duration) || 1000);
      }, 0);
      
      combinedKeyframes.push({
        ...keyframe,
        offset: currentTime / totalTime,
      });
    });
    totalDuration += duration;
  });

  return {
    keyframes: combinedKeyframes,
    options: {
      duration: totalDuration,
      ...options,
    },
  };
}

// Export all patterns
export const patterns = {
  ...transformPatterns,
  ...motionPatterns,
  ...attentionPatterns,
  ...combinedPatterns,
} as const;

// Export pattern types
export type AnimationPatternName = keyof typeof patterns;
export type { AnimationDefinition };
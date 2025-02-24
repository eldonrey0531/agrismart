import { useCallback, useEffect, useRef, useState } from 'react';

// Animation timing function presets
export const timingFunctions = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 1 
      ? 1 
      : -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};

// Animation pattern presets
export const patterns = {
  float: {
    duration: 3000,
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
    ],
    easing: 'ease-in-out',
    iterations: Infinity,
  },
  pulse: {
    duration: 2000,
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' },
    ],
    easing: 'ease-in-out',
    iterations: Infinity,
  },
  shake: {
    duration: 800,
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(0)' },
    ],
    easing: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    iterations: 1,
  },
};

export type ExtendedAnimationOptions = Omit<KeyframeAnimationOptions, 'easing'> & {
  easing?: string | ((t: number) => number);
  onComplete?: () => void;
};

interface UseAnimationResult {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isRunning: boolean;
}

export function useAnimation(
  element: React.RefObject<HTMLElement>,
  keyframes: Keyframe[],
  options: ExtendedAnimationOptions = {}
): UseAnimationResult {
  const animationRef = useRef<Animation | null>(null);
  const isRunningRef = useRef(false);

  const start = useCallback(() => {
    if (!element.current) return;

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    // Process easing function
    let easing: string;
    if (typeof options.easing === 'function') {
      // Convert function to CSS timing
      const fn = options.easing;
      easing = `cubic-bezier(${fn(0.25)}, ${fn(0.5)}, ${fn(0.75)}, ${fn(1)})`;
    } else {
      easing = options.easing || 'linear';
    }

    // Create new animation with processed options
    const animationOptions: KeyframeAnimationOptions = {
      ...options,
      easing,
    };

    animationRef.current = element.current.animate(keyframes, animationOptions);

    // Handle animation completion
    animationRef.current.onfinish = () => {
      isRunningRef.current = false;
      options.onComplete?.();
    };

    isRunningRef.current = true;
  }, [element, keyframes, options]);

  const pause = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
      isRunningRef.current = false;
    }
  }, []);

  const resume = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.play();
      isRunningRef.current = true;
    }
  }, []);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
      isRunningRef.current = false;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.cancel();
      }
    };
  }, []);

  return {
    start,
    pause,
    resume,
    stop,
    isRunning: isRunningRef.current,
  };
}

// Reduced motion hook
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Composition utility
export function composeAnimations(
  animations: Array<{
    keyframes: Keyframe[];
    options?: ExtendedAnimationOptions;
  }>
): { keyframes: Keyframe[]; options: ExtendedAnimationOptions } {
  const totalDuration = animations.reduce((sum, { options = {} }) => {
    return sum + (Number(options.duration) || 1000) + (Number(options.delay) || 0);
  }, 0);

  const composedKeyframes: Keyframe[] = [];

  let currentTime = 0;
  animations.forEach(({ keyframes, options = {} }) => {
    const duration = Number(options.duration) || 1000;
    const delay = Number(options.delay) || 0;

    keyframes.forEach((keyframe, index) => {
      const offset = (currentTime + delay + (index * duration) / (keyframes.length - 1)) / totalDuration;
      composedKeyframes.push({
        ...keyframe,
        offset,
      });
    });

    currentTime += duration + delay;
  });

  return {
    keyframes: composedKeyframes,
    options: {
      duration: totalDuration,
      easing: 'linear',
    },
  };
}

export type TimingFunction = keyof typeof timingFunctions;
export type AnimationPattern = keyof typeof patterns;
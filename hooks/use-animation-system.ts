import { useEffect, useState } from 'react';

/**
 * Hook to check if the user prefers reduced motion
 * Uses the matchMedia API to detect prefers-reduced-motion preference
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Add listener for changes
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to create spring animations
 * @param config Animation configuration
 */
export function useSpringAnimation(config: {
  tension?: number;
  friction?: number;
  velocity?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  // If user prefers reduced motion, return null values
  if (prefersReducedMotion) {
    return {
      animation: null,
      velocity: 0,
    };
  }

  // Default configuration
  const {
    tension = 170,
    friction = 26,
    velocity = 0,
  } = config;

  return {
    animation: `spring ${tension}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
    velocity,
  };
}

/**
 * Hook to create fade animations
 * @param duration Duration in milliseconds
 */
export function useFadeAnimation(duration: number = 300) {
  const prefersReducedMotion = useReducedMotion();

  return {
    entering: {
      opacity: 0,
      transition: prefersReducedMotion ? 'none' : `opacity ${duration}ms ease-out`,
    },
    entered: {
      opacity: 1,
      transition: prefersReducedMotion ? 'none' : `opacity ${duration}ms ease-out`,
    },
    exiting: {
      opacity: 0,
      transition: prefersReducedMotion ? 'none' : `opacity ${duration}ms ease-in`,
    },
  };
}

/**
 * Hook to create slide animations
 * @param direction Direction of slide
 * @param distance Distance to slide in pixels
 * @param duration Duration in milliseconds
 */
export function useSlideAnimation(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 20,
  duration: number = 300
) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return {
      entering: {},
      entered: {},
      exiting: {},
    };
  }

  const getTransform = (active: boolean) => {
    const value = active ? 0 : distance;
    switch (direction) {
      case 'up':
        return `translateY(${value}px)`;
      case 'down':
        return `translateY(-${value}px)`;
      case 'left':
        return `translateX(${value}px)`;
      case 'right':
        return `translateX(-${value}px)`;
    }
  };

  return {
    entering: {
      opacity: 0,
      transform: getTransform(false),
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    },
    entered: {
      opacity: 1,
      transform: getTransform(true),
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    },
    exiting: {
      opacity: 0,
      transform: getTransform(false),
      transition: `opacity ${duration}ms ease-in, transform ${duration}ms ease-in`,
    },
  };
}

/**
 * Hook to create scale animations
 * @param startScale Initial scale value
 * @param duration Duration in milliseconds
 */
export function useScaleAnimation(startScale: number = 0.95, duration: number = 300) {
  const prefersReducedMotion = useReducedMotion();

  return {
    entering: {
      opacity: 0,
      transform: `scale(${startScale})`,
      transition: prefersReducedMotion 
        ? 'none' 
        : `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    },
    entered: {
      opacity: 1,
      transform: 'scale(1)',
      transition: prefersReducedMotion 
        ? 'none' 
        : `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    },
    exiting: {
      opacity: 0,
      transform: `scale(${startScale})`,
      transition: prefersReducedMotion 
        ? 'none' 
        : `opacity ${duration}ms ease-in, transform ${duration}ms ease-in`,
    },
  };
}
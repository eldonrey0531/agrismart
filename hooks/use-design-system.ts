import { useTheme } from 'next-themes';
import { designTokens } from '@/lib/config/design-constants';
import { prefersReducedMotion, getThemeValue } from '@/lib/utils/design-utils';
import type { ThemeMode, ContainerSize, BreakpointSize, SpacingSize } from '@/lib/types/layout';

export function useDesignSystem() {
  const { theme, setTheme } = useTheme();
  const reducedMotion = prefersReducedMotion();

  /**
   * Get a color value with theme awareness
   */
  const getColor = (path: string, fallback?: string): string => {
    const color = path.split('.').reduce((obj, key) => obj[key], designTokens.colors as any);
    return color || fallback || '';
  };

  /**
   * Get spacing value
   */
  const getSpacing = (size: SpacingSize | number): string => {
    if (typeof size === 'number') {
      return `${size * 4}px`;
    }
    return designTokens.spacing[size] || '0';
  };

  /**
   * Get container max width
   */
  const getContainerWidth = (size: ContainerSize): string => {
    return designTokens.containers[size] || '100%';
  };

  /**
   * Get breakpoint value
   */
  const getBreakpoint = (size: BreakpointSize): string => {
    return designTokens.breakpoints[size] || '0';
  };

  /**
   * Get animation duration considering reduced motion preference
   */
  const getAnimationDuration = (duration: number | string): string => {
    if (reducedMotion) return '0ms';
    if (typeof duration === 'number') return `${duration}ms`;
    return duration;
  };

  /**
   * Get font stack
   */
  const getFontStack = (type: 'heading' | 'body'): string => {
    return designTokens.typography.fonts[type];
  };

  /**
   * Get font size with optional responsive values
   */
  const getFontSize = (size: keyof typeof designTokens.typography.fontSizes): string => {
    return designTokens.typography.fontSizes[size];
  };

  /**
   * Check if current theme is dark
   */
  const isDarkMode = (): boolean => {
    return theme === 'dark' || (theme === 'system' && window?.matchMedia('(prefers-color-scheme: dark)').matches);
  };

  /**
   * Get pattern background
   */
  const getPattern = (type: keyof typeof designTokens.animation.patterns): string => {
    return designTokens.animation.patterns[type];
  };

  /**
   * Format spacing for margin/padding
   */
  const formatSpacing = (value: number | string | SpacingSize): string => {
    if (typeof value === 'number') return getSpacing(value);
    if (typeof value === 'string' && value in designTokens.spacing) {
      return designTokens.spacing[value as SpacingSize];
    }
    return value as string;
  };

  /**
   * Media query helper
   */
  const mediaQuery = (breakpoint: BreakpointSize): string => {
    return `@media (min-width: ${getBreakpoint(breakpoint)})`;
  };

  return {
    theme,
    setTheme,
    reducedMotion,
    getColor,
    getSpacing,
    getContainerWidth,
    getBreakpoint,
    getAnimationDuration,
    getFontStack,
    getFontSize,
    isDarkMode,
    getPattern,
    formatSpacing,
    mediaQuery,
    tokens: designTokens,
  };
}

export type UseDesignSystem = ReturnType<typeof useDesignSystem>;
export default useDesignSystem;
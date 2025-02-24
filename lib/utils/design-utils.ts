import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  type ColorCategory,
  type PrimaryColorKey,
  type SecondaryColorKey,
  type SupportColorKey,
  type SpacingToken,
  type PatternConfig,
  getPrimaryColor,
  getSecondaryColor,
  getSupportColor,
  getPattern,
  getSpacing,
} from '@/lib/types/design-tokens';

// Merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check for reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Generate color style with opacity
export function withOpacity(colorValue: string, opacity: number): string {
  const rgbColor = hexToRgb(colorValue);
  if (!rgbColor) return colorValue;
  return `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${opacity})`;
}

// Type-safe color getter with opacity
export function getColorWithOpacity(
  category: 'primary',
  key: PrimaryColorKey,
  opacity?: number
): string;
export function getColorWithOpacity(
  category: 'secondary',
  key: SecondaryColorKey,
  opacity?: number
): string;
export function getColorWithOpacity(
  category: 'support',
  key: SupportColorKey,
  opacity?: number
): string;
export function getColorWithOpacity(
  category: ColorCategory,
  key: PrimaryColorKey | SecondaryColorKey | SupportColorKey,
  opacity?: number
): string {
  let color: string;
  
  switch (category) {
    case 'primary':
      color = getPrimaryColor(key as PrimaryColorKey);
      break;
    case 'secondary':
      color = getSecondaryColor(key as SecondaryColorKey);
      break;
    case 'support':
      color = getSupportColor(key as SupportColorKey);
      break;
    default:
      throw new Error(`Invalid color category: ${category}`);
  }

  if (opacity !== undefined) {
    return withOpacity(color, opacity);
  }
  return color;
}

// Create spacing value with unit
export function createSpacing(
  token: SpacingToken | number,
  unit: 'px' | 'rem' = 'rem'
): string {
  if (typeof token === 'number') {
    return `${token}${unit}`;
  }
  return getSpacing(token);
}

// Generate pattern background style
export function generatePattern(config: PatternConfig): string {
  const basePattern = getPattern(config.type);
  const style = [basePattern];

  if (config.opacity) {
    style.push(`opacity: ${config.opacity}`);
  }

  if (config.scale) {
    style.push(`background-size: ${config.scale}px ${config.scale}px`);
  }

  if (config.color) {
    style.push(`background-color: ${config.color}`);
  }

  return style.join(';');
}

// Convert hex color to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate contrast ratio
export function getContrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return 1;

  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

// Calculate relative luminance
function getLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Check if contrast meets WCAG standards
export function meetsContrastStandards(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

// Type-safe breakpoint keys
export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Create responsive style object
export function createResponsiveStyles<T>(
  property: string,
  values: { [K in BreakpointKey | 'base']?: T }
): { [key: string]: any } {
  const breakpoints: { [K in BreakpointKey]: string } = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  };

  return Object.entries(values).reduce((styles, [breakpoint, value]) => {
    if (breakpoint === 'base') {
      styles[property] = String(value);
    } else if (breakpoint in breakpoints) {
      styles[`@media (min-width: ${breakpoints[breakpoint as BreakpointKey]})`] = {
        [property]: String(value),
      };
    }
    return styles;
  }, {} as { [key: string]: any });
}
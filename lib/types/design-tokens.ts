import { designTokens } from '@/lib/config/design-constants';

// Component Types
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ThemeMode = 'light' | 'dark' | 'system';

// Direct Token Types
export type SpacingToken = keyof typeof designTokens.spacing;
export type BreakpointToken = keyof typeof designTokens.breakpoints;
export type ContainerToken = keyof typeof designTokens.containers;

// Color System
export type ColorCategory = keyof typeof designTokens.colors;

// Each color category's keys
export type PrimaryColorKey = keyof typeof designTokens.colors.primary;
export type SecondaryColorKey = keyof typeof designTokens.colors.secondary;
export type SupportColorKey = keyof typeof designTokens.colors.support;

// Typography System
export type FontFamily = keyof typeof designTokens.typography.fonts;
export type FontSize = keyof typeof designTokens.typography.fontSizes;
export type FontWeight = keyof typeof designTokens.typography.fontWeights;
export type LineHeight = keyof typeof designTokens.typography.lineHeights;

// Animation System
export type Duration = keyof typeof designTokens.animation.durations;
export type TimingFunction = keyof typeof designTokens.animation.timingFunctions;
export type Pattern = keyof typeof designTokens.animation.patterns;

// Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface StyleProps extends BaseComponentProps {
  variant?: string;
  size?: ComponentSize;
  theme?: ThemeMode;
  style?: React.CSSProperties;
}

// Config Types
export interface AnimationConfig {
  duration?: Duration;
  easing?: TimingFunction;
  delay?: number;
  reduceMotion?: boolean;
}

export interface PatternConfig {
  type: Pattern;
  opacity?: number;
  scale?: number;
  color?: string;
  background?: string;
}

export interface ResponsiveConfig<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Token Access Helpers
export function getSpacing(token: SpacingToken): string {
  return designTokens.spacing[token];
}

export function getBreakpoint(token: BreakpointToken): string {
  return designTokens.breakpoints[token];
}

export function getContainer(token: ContainerToken): string {
  return designTokens.containers[token];
}

// Type-safe color getters
export function getPrimaryColor(key: PrimaryColorKey): string {
  return designTokens.colors.primary[key];
}

export function getSecondaryColor(key: SecondaryColorKey): string {
  return designTokens.colors.secondary[key];
}

export function getSupportColor(key: SupportColorKey): string {
  return designTokens.colors.support[key];
}

// Type-safe overloaded color getter
export function getColor(category: 'primary', key: PrimaryColorKey): string;
export function getColor(category: 'secondary', key: SecondaryColorKey): string;
export function getColor(category: 'support', key: SupportColorKey): string;
export function getColor(
  category: ColorCategory,
  key: PrimaryColorKey | SecondaryColorKey | SupportColorKey
): string {
  switch (category) {
    case 'primary':
      return designTokens.colors.primary[key as PrimaryColorKey];
    case 'secondary':
      return designTokens.colors.secondary[key as SecondaryColorKey];
    case 'support':
      return designTokens.colors.support[key as SupportColorKey];
    default:
      throw new Error(`Invalid color category: ${category}`);
  }
}

export function getFontSize(token: FontSize): string {
  return designTokens.typography.fontSizes[token];
}

export function getFontFamily(token: FontFamily): string {
  return designTokens.typography.fonts[token];
}

export function getFontWeight(token: FontWeight): string {
  return designTokens.typography.fontWeights[token];
}

export function getLineHeight(token: LineHeight): string {
  return designTokens.typography.lineHeights[token];
}

export function getDuration(token: Duration): string {
  return designTokens.animation.durations[token];
}

export function getTimingFunction(token: TimingFunction): string {
  return designTokens.animation.timingFunctions[token];
}

export function getPattern(token: Pattern): string {
  return designTokens.animation.patterns[token];
}

// Type Guards
export function isPrimaryColorKey(value: unknown): value is PrimaryColorKey {
  return typeof value === 'string' && value in designTokens.colors.primary;
}

export function isSecondaryColorKey(value: unknown): value is SecondaryColorKey {
  return typeof value === 'string' && value in designTokens.colors.secondary;
}

export function isSupportColorKey(value: unknown): value is SupportColorKey {
  return typeof value === 'string' && value in designTokens.colors.support;
}

export function isSpacingToken(value: unknown): value is SpacingToken {
  return typeof value === 'string' && value in designTokens.spacing;
}

export function isBreakpointToken(value: unknown): value is BreakpointToken {
  return typeof value === 'string' && value in designTokens.breakpoints;
}
import { designTokens } from '@/lib/config/design-constants';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Base types
type StringRecord<T extends string> = Record<T, string>;

// Spacing types
export type SpacingKey = Extract<keyof typeof designTokens.spacing, string>;
export type SpacingValue = string;
export type SpacingRecord = StringRecord<SpacingKey>;

// Breakpoint types
export type BreakpointKey = Extract<keyof typeof designTokens.breakpoints, string>;
export type BreakpointValue = string;
export type BreakpointRecord = StringRecord<BreakpointKey>;

// Container types
export type ContainerKey = Extract<keyof typeof designTokens.containers, string>;
export type ContainerValue = string;
export type ContainerRecord = StringRecord<ContainerKey>;

// Color types
export type ColorPrimary = Extract<keyof typeof designTokens.colors.primary, string>;
export type ColorSecondary = Extract<keyof typeof designTokens.colors.secondary, string>;
export type ColorSupport = Extract<keyof typeof designTokens.colors.support, string>;
export type ColorCategory = 'primary' | 'secondary' | 'support';
export type ColorPath = `${ColorCategory}.${string}`;

// Typography types
type TypographyRecord = typeof designTokens.typography;
export type FontSizeKey = Extract<keyof TypographyRecord['fontSizes'], string>;
export type FontWeightKey = Extract<keyof TypographyRecord['fontWeights'], string>;
export type LineHeightKey = Extract<keyof TypographyRecord['lineHeights'], string>;
export type FontStackKey = Extract<keyof TypographyRecord['fonts'], string>;

// Animation types
type AnimationRecord = typeof designTokens.animation;
export type DurationKey = Extract<keyof AnimationRecord['durations'], string>;
export type TimingFunctionKey = Extract<keyof AnimationRecord['timingFunctions'], string>;
export type PatternKey = Extract<keyof AnimationRecord['patterns'], string>;

// Design token types
export interface DesignTokens {
  breakpoints: BreakpointRecord;
  containers: ContainerRecord;
  spacing: SpacingRecord;
  typography: {
    fonts: StringRecord<FontStackKey>;
    fontSizes: StringRecord<FontSizeKey>;
    fontWeights: StringRecord<FontWeightKey>;
    lineHeights: StringRecord<LineHeightKey>;
  };
  colors: {
    primary: StringRecord<ColorPrimary>;
    secondary: StringRecord<ColorSecondary>;
    support: StringRecord<ColorSupport>;
  };
  animation: {
    durations: StringRecord<DurationKey>;
    timingFunctions: StringRecord<TimingFunctionKey>;
    patterns: StringRecord<PatternKey>;
  };
}

// Theme configuration
export interface ThemeConfig {
  mode: ThemeMode;
  colors: Record<ColorPath, string>;
}

// Design system hook return type
export interface DesignSystemUtils {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  reducedMotion: boolean;
  getColor: (path: ColorPath, fallback?: string) => string;
  getSpacing: (size: SpacingKey | number) => string;
  getContainerWidth: (size: ContainerKey) => string;
  getBreakpoint: (size: BreakpointKey) => string;
  getAnimationDuration: (duration: DurationKey | number) => string;
  getFontStack: (type: FontStackKey) => string;
  getFontSize: (size: FontSizeKey) => string;
  isDarkMode: () => boolean;
  getPattern: (type: PatternKey) => string;
  formatSpacing: (value: number | string | SpacingKey) => string;
  mediaQuery: (breakpoint: BreakpointKey) => string;
  tokens: DesignTokens;
}

// Pattern configuration
export interface PatternConfig {
  type: PatternKey;
  opacity?: number;
  size?: number;
  color?: string;
  background?: string;
}

// Responsive value type
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey, T>>;

// Style configuration
export interface StyleConfig {
  theme?: ThemeMode;
  reducedMotion?: boolean;
  patterns?: PatternConfig[];
  responsive?: boolean;
}

// Spacing configuration
export interface SpacingConfig {
  value: number | SpacingKey;
  unit?: 'px' | 'rem' | 'em' | '%';
  scale?: number;
}

// Export constants
export const THEMES: ThemeMode[] = ['light', 'dark', 'system'];

export const BASE_SPACING = 4; // 4px base unit
export const BASE_FONT_SIZE = 16; // 16px base font size
export const BASE_LINE_HEIGHT = 1.5; // 1.5 base line height
import { ReactNode } from 'react';

// Type definitions for nested objects
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type ColorValue = string;
type StyleValue = string;

export interface ThemeColorSet {
  [key: string]: ColorValue;
  background: ColorValue;
  surface: ColorValue;
  base: ColorValue;
  hover: ColorValue;
  active: ColorValue;
  foreground: ColorValue;
}

export interface ThemeSupportColors {
  [key: string]: ColorValue;
  border: ColorValue;
  mutedText: ColorValue;
  darkText: ColorValue;
  lightText: ColorValue;
  error: ColorValue;
  warning: ColorValue;
  info: ColorValue;
}

export interface ThemeFocusStyles {
  [key: string]: StyleValue;
  outline: ColorValue;
  outlineWidth: StyleValue;
  outlineStyle: StyleValue;
  ring: ColorValue;
  ringWidth: StyleValue;
  ringOffset: ColorValue;
  ringOffsetWidth: StyleValue;
}

export interface ThemeStatusColors {
  [key: string]: ColorValue;
  online: ColorValue;
  offline: ColorValue;
  away: ColorValue;
  busy: ColorValue;
}

export interface ThemeTypography {
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSizes: Record<string, string>;
  fontWeights: Record<string, string>;
  lineHeights: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface ThemeSpacing {
  button: {
    padding: {
      x: string;
      y: string;
    };
    gap: string;
    minHeight: string;
  };
  input: {
    padding: {
      x: string;
      y: string;
    };
    gap: string;
    minHeight: string;
  };
  container: {
    padding: {
      x: string;
      y: string;
    };
    gap: string;
  };
}

export interface ThemeBorders {
  width: Record<string, string>;
  style: string;
  radius: Record<string, string>;
}

export interface ThemeMotion {
  duration: Record<string, string>;
  timing: Record<string, string>;
}

export interface ThemeFocusVisible {
  outline: string;
  outlineOffset: string;
}

export interface Theme {
  name: string;
  colors: {
    primary: ThemeColorSet;
    secondary: ThemeColorSet;
    support: ThemeSupportColors;
    focus: ThemeFocusStyles;
    status: ThemeStatusColors;
  };
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
  motion: ThemeMotion;
  focusVisible: ThemeFocusVisible;
}

// Theme creation utility
export function createTheme(themeConfig: Theme): Theme {
  return themeConfig;
}

// CSS variable generation
export function generateThemeVariables(theme: Theme): Record<string, string> {
  const variables: Record<string, string> = {};

  // Process colors
  type ColorGroups = Theme['colors'];
  type ColorGroupKeys = keyof ColorGroups;

  // Handle each color group
  (Object.keys(theme.colors) as ColorGroupKeys[]).forEach((groupKey) => {
    const group = theme.colors[groupKey];
    Object.entries(group).forEach(([key, value]) => {
      if (typeof value === 'string') {
        variables[`--color-${groupKey}-${key}`] = value;
      }
    });
  });

  // Process typography
  Object.entries(theme.typography.fonts).forEach(([key, value]) => {
    variables[`--font-${key}`] = value;
  });

  Object.entries(theme.typography.fontSizes).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });

  // Process spacing recursively
  function processSpacing(prefix: string, obj: Record<string, unknown>) {
    Object.entries(obj).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        processSpacing(`${prefix}-${key}`, value as Record<string, unknown>);
      } else if (typeof value === 'string') {
        variables[`--spacing-${prefix}-${key}`] = value;
      }
    });
  }

  Object.entries(theme.spacing).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      processSpacing(key, value as Record<string, unknown>);
    }
  });

  return variables;
}

// Theme combination utility
export function combineThemes(baseTheme: Theme, ...overrides: DeepPartial<Theme>[]): Theme {
  return overrides.reduce<Theme>((result, override) => {
    if (!override) return result;
    return deepMerge(result, override);
  }, { ...baseTheme });
}

// Deep merge utility
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (sourceValue === undefined) continue;

      if (isObject(sourceValue) && isObject(targetValue)) {
        (result as any)[key] = deepMerge(
          targetValue as object,
          sourceValue as DeepPartial<typeof targetValue>
        );
      } else {
        (result as any)[key] = sourceValue;
      }
    }
  }

  return result;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

// Theme contrast checker
export function checkThemeContrast(theme: Theme): boolean {
  const contrastRatios = {
    text: calculateContrastRatio(
      theme.colors.primary.background,
      theme.colors.primary.foreground
    ),
    interactive: calculateContrastRatio(
      theme.colors.primary.base,
      theme.colors.primary.foreground
    ),
  };

  return contrastRatios.text >= 4.5 && contrastRatios.interactive >= 3;
}

// Contrast ratio calculator
function calculateContrastRatio(background: string, foreground: string): number {
  const bg = getLuminance(hexToRgb(background));
  const fg = getLuminance(hexToRgb(foreground));
  
  const lighter = Math.max(bg, fg);
  const darker = Math.min(bg, fg);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Color conversion utilities
interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const value = v / 255;
    return value <= 0.03928 
      ? value / 12.92 
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export type ThemeOverride = DeepPartial<Theme>;
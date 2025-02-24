// Base color keys that all themes share
export type BaseColorKey = "primary" | "secondary" | "accent" | "background" | "text";

// Additional color keys for the nature theme
export type NatureColorKey = BaseColorKey | "success" | "warning" | "error" | "muted";

// Theme types
export type ThemeType = "light" | "dark" | "nature" | "system";

// Color theme configuration
export interface ThemeColorConfig {
  light: Record<BaseColorKey, string>;
  dark: Record<BaseColorKey, string>;
  nature: Record<NatureColorKey, string>;
}

// Theme settings
export interface ThemeSettings {
  defaultTheme: ThemeType;
  storageKey: string;
  themes: ThemeType[];
}

// Animation timing based on natural phenomena
export interface NatureTimings {
  breeze: number;   // Quick animations
  leaf: number;     // Gentle animations
  branch: number;   // Moderate animations
  tree: number;     // Slower animations
  growth: number;   // Natural progressions
}

// Nature-themed opacity levels
export interface NatureOpacity {
  leaf: string;     // Slightly transparent
  mist: string;     // Moderate transparency
  dew: string;      // More transparent
  air: string;      // Very transparent
  trace: string;    // Nearly transparent
}

// Gradient configurations
export interface NatureGradients {
  forest: string;
  sunrise: string;
  sunset: string;
  meadow: string;
  river: string;
}

// Extended theme configuration
export interface ExtendedThemeConfig {
  colors: ThemeColorConfig;
  timings: NatureTimings;
  opacity: NatureOpacity;
  gradients: NatureGradients;
  animations: {
    float: string;
    grow: string;
    fade: string;
    sway: string;
  };
}
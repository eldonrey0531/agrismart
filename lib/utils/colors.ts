import { natureColors } from "@/components/providers/theme-provider";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { 
  BaseColorKey, 
  NatureColorKey, 
  ThemeType, 
  ThemeColorConfig,
} from "@/types/theme";

// Type guards
function isNatureTheme(theme: ThemeType): theme is "nature" {
  return theme === "nature";
}

function isNatureColorKey(key: BaseColorKey | NatureColorKey): key is NatureColorKey {
  return ["success", "warning", "error", "muted"].includes(key as string);
}

// Color utilities
export const colors = {
  // Get color value for theme and key
  getColor: (theme: Exclude<ThemeType, "system">, key: BaseColorKey | NatureColorKey): string => {
    if (isNatureTheme(theme) && isNatureColorKey(key)) {
      return natureColors.nature[key];
    }
    return natureColors[theme][key as BaseColorKey];
  },

  // Get CSS variable name for color
  getColorVar: (key: BaseColorKey | NatureColorKey): string => {
    return `--color-${key}`;
  },

  // Create Tailwind-compatible color class
  createColorClass: (key: BaseColorKey | NatureColorKey, property: string): string => {
    return `${property}-[var(--color-${key})]`;
  },

  // Get all colors for a theme
  getThemeColors: (theme: Exclude<ThemeType, "system">): Record<string, string> => {
    return natureColors[theme];
  },

  // Check if color is dark
  isDarkColor: (color: string): boolean => {
    const [r, g, b] = hexToRgb(color);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  },

  // Get contrast color
  getContrastColor: (bgColor: string): "black" | "white" => {
    return colors.isDarkColor(bgColor) ? "white" : "black";
  },

  // Adjust color brightness
  adjustColorBrightness: (color: string, amount: number): string => {
    const [r, g, b] = hexToRgb(color);
    const adjust = (c: number) => Math.min(255, Math.max(0, c + amount));
    return rgbToHex(adjust(r), adjust(g), adjust(b));
  },

  // Create color palette
  createColorPalette: (baseColor: string): Record<string, string> => {
    const palette: Record<string, string> = {};
    const [r, g, b] = hexToRgb(baseColor);

    for (let i = 1; i <= 9; i++) {
      const amount = (i - 5) * 30; // -120 to +120 range
      palette[`${i}00`] = colors.adjustColorBrightness(baseColor, amount);
    }

    return palette;
  },
};

// Helper functions
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error("Invalid hex color");
  
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map(x => Math.round(x).toString(16).padStart(2, "0"))
    .join("")}`;
}

// CSS variable definitions
export function cssColorVariables(theme: Exclude<ThemeType, "system"> = "light"): string {
  const themeColors = colors.getThemeColors(theme);
  return Object.entries(themeColors)
    .map(([key, value]) => `${colors.getColorVar(key as BaseColorKey | NatureColorKey)}: ${value};`)
    .join("\n");
}

// Nature-themed values
export const natureOpacity = {
  leaf: "0.85",    // Slightly transparent
  mist: "0.65",    // Moderate transparency
  dew: "0.45",     // More transparent
  air: "0.25",     // Very transparent
  trace: "0.15",   // Nearly transparent
} as const;

export const natureTimings = {
  breeze: 200,     // Quick
  leaf: 300,       // Gentle
  branch: 500,     // Moderate
  tree: 700,       // Slower
  growth: 1000,    // Natural
} as const;

export const natureGradients = {
  forest: `linear-gradient(to bottom right, ${natureColors.nature.primary}, ${natureColors.nature.secondary})`,
  sunrise: `linear-gradient(to top, ${natureColors.nature.warning}, ${natureColors.nature.accent})`,
  sunset: `linear-gradient(to bottom, ${natureColors.nature.error}, ${natureColors.nature.warning})`,
  meadow: `linear-gradient(to right, ${natureColors.nature.success}, ${natureColors.nature.secondary})`,
  river: `linear-gradient(to left, ${natureColors.nature.accent}, ${natureColors.nature.primary})`,
} as const;

export default colors;
import { createTheme } from '@/lib/utils/theme-utils';

export const highContrastTheme = createTheme({
  name: 'high-contrast',
  colors: {
    // Primary colors with high contrast ratios (tested with WebAIM)
    primary: {
      background: '#000000', // Black background
      surface: '#1A1A1A', // Very dark gray surface
      base: '#00FF00', // High-visibility green
      hover: '#00CC00',
      active: '#009900',
      foreground: '#FFFFFF', // Pure white text
    },

    // Secondary colors with emphasis on visibility
    secondary: {
      accent: '#FFFF00', // High-visibility yellow
      interactive: '#00FFFF', // High-visibility cyan
      success: '#00FF00', // High-visibility green
      hover: '#FFCC00',
      active: '#FF9900',
      foreground: '#000000',
    },

    // Support colors for clear distinction
    support: {
      border: '#FFFFFF', // White borders for clear boundaries
      mutedText: '#CCCCCC', // Light gray that maintains readability
      darkText: '#000000',
      lightText: '#FFFFFF',
      error: '#FF0000', // Pure red for errors
      warning: '#FFFF00', // High-visibility yellow for warnings
      info: '#00FFFF', // High-visibility cyan for info
    },

    // Focus states
    focus: {
      outline: '#FFFFFF',
      outlineWidth: '3px', // Thicker outline for better visibility
      outlineStyle: 'solid',
      ring: '#FFFF00',
      ringWidth: '4px',
      ringOffset: '#000000',
      ringOffsetWidth: '2px',
    },

    // Status indicators
    status: {
      online: '#00FF00',
      offline: '#FF0000',
      away: '#FFFF00',
      busy: '#FF00FF',
    },
  },

  // Typography with enhanced readability
  typography: {
    fonts: {
      heading: 'Arial, sans-serif', // Simple, clear fonts
      body: 'Verdana, sans-serif',
      mono: 'Consolas, monospace',
    },
    fontSizes: {
      xs: '1rem', // Larger minimum font size
      sm: '1.125rem',
      base: '1.25rem',
      lg: '1.5rem',
      xl: '1.875rem',
      '2xl': '2.25rem',
      '3xl': '3rem',
      '4xl': '3.75rem',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700', // Use bolder fonts for better visibility
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.75', // Increased line height for better readability
      relaxed: '2',
      loose: '2.25',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em', // Increased letter spacing options
    },
  },

  // Spacing and layout
  spacing: {
    // Increased spacing for better touch targets
    button: {
      padding: {
        x: '2rem',
        y: '1rem',
      },
      gap: '1rem',
      minHeight: '3rem',
    },
    input: {
      padding: {
        x: '1.5rem',
        y: '1rem',
      },
      gap: '1rem',
      minHeight: '3rem',
    },
    container: {
      padding: {
        x: '2rem',
        y: '2rem',
      },
      gap: '2rem',
    },
  },

  // Borders and outlines
  borders: {
    width: {
      thin: '2px', // Thicker minimum border
      medium: '3px',
      thick: '4px',
    },
    style: 'solid',
    radius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px',
    },
  },

  // Motion and animation
  motion: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'ease',
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Focus outline settings
  focusVisible: {
    outline: '3px solid #FFFFFF',
    outlineOffset: '2px',
  },
});

// CSS variables for the high contrast theme
export const highContrastVariables = {
  '--color-high-contrast-background': '#000000',
  '--color-high-contrast-foreground': '#FFFFFF',
  '--color-high-contrast-primary': '#00FF00',
  '--color-high-contrast-secondary': '#FFFF00',
  '--color-high-contrast-error': '#FF0000',
  '--color-high-contrast-focus': '#FFFFFF',
  '--font-size-base': '1.25rem',
  '--line-height-base': '1.75',
  '--focus-ring-width': '3px',
  '--focus-ring-color': '#FFFFFF',
} as const;

// Utility types
export type HighContrastTheme = typeof highContrastTheme;
export type HighContrastVariables = typeof highContrastVariables;
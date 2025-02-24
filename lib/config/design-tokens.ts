export const designTokens = {
  colors: {
    primary: {
      background: '#0D1117', // deep night sky
      surface: '#161B22',    // forest shadow
      base: '#2C5F2D'        // evergreen
    },
    secondary: {
      accent: '#97BF04',     // spring leaf
      interactive: '#FFB800', // golden sunlight
      success: '#238636'      // fresh growth
    },
    support: {
      border: '#4A6741',      // forest understory
      mutedText: '#8B949E',   // morning mist
      darkText: '#333333',    // rich earth
      lightText: '#F5F5F5'    // clear sky
    }
  },
  typography: {
    fonts: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    sizes: {
      mobile: {
        base: '16px',
        sm: '20px',
        md: '24px',
        lg: '32px',
        xl: '48px'
      },
      desktop: {
        base: '16px',
        sm: '20px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        xxl: '64px'
      }
    }
  },
  spacing: {
    base: '8px',
    units: {
      1: '8px',
      2: '16px',
      3: '24px',
      4: '32px',
      6: '48px',
      8: '64px',
      12: '96px'
    }
  },
  layout: {
    maxWidth: {
      container: '1200px',
      hero: '960px',
      content: '640px'
    },
    header: {
      height: '64px'
    },
    grid: {
      columns: {
        desktop: 3,
        tablet: 2,
        mobile: 1
      },
      gap: '32px'
    }
  },
  transitions: {
    base: '200ms ease-in-out',
    dropdown: '200ms ease-out',
    mobileMenu: '300ms ease-in-out'
  },
  animation: {
    heroFloat: {
      duration: '3s',
      timing: 'ease-in-out'
    }
  },
  accessibility: {
    focus: {
      outline: '2px solid #58A6FF',
      offset: '2px'
    },
    reducedMotion: {
      transition: '0ms'
    }
  },
  components: {
    button: {
      height: '48px',
      padding: '0 24px',
      borderRadius: '6px',
      fontSize: '16px',
      transitions: '150ms ease'
    },
    input: {
      height: '40px',
      padding: '0 16px',
      borderRadius: '6px',
      borderWidth: '1px'
    },
    icons: {
      size: '24px'
    }
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  },
  // Performance thresholds
  performance: {
    lcp: 2500,    // 2.5s
    fid: 100,     // 100ms
    cls: 0.1
  }
} as const;

// Type definitions for design tokens
export type DesignTokens = typeof designTokens;
export type ColorToken = keyof typeof designTokens.colors;
export type SpacingUnit = keyof typeof designTokens.spacing.units;
export type Breakpoint = keyof typeof designTokens.breakpoints;

// Utility functions for accessing design tokens
export const getColor = (
  category: keyof typeof designTokens.colors,
  variant: string
): string => {
  return designTokens.colors[category][variant as keyof typeof designTokens.colors[typeof category]];
};

export const getSpacing = (unit: SpacingUnit): string => {
  return designTokens.spacing.units[unit];
};

export const getBreakpoint = (size: Breakpoint): string => {
  return designTokens.breakpoints[size];
};

export default designTokens;
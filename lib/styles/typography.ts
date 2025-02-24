import { cva } from 'class-variance-authority';
import { designTokens } from '@/lib/config/design-tokens';

// Base font configuration
export const fontConfig = {
  heading: designTokens.typography.fonts.heading,
  body: designTokens.typography.fonts.body,
};

// Font weight configuration
export const fontWeights = designTokens.typography.weights;

// Typography scale utilities
export const typography = {
  // Heading styles
  h1: cva('font-heading', {
    variants: {
      size: {
        desktop: 'text-[64px] leading-[1.1]',
        mobile: 'text-[48px] leading-[1.2]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'desktop',
      weight: 'bold',
    },
  }),

  h2: cva('font-heading', {
    variants: {
      size: {
        desktop: 'text-[48px] leading-[1.2]',
        mobile: 'text-[32px] leading-[1.3]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'desktop',
      weight: 'semibold',
    },
  }),

  h3: cva('font-heading', {
    variants: {
      size: {
        desktop: 'text-[32px] leading-[1.3]',
        mobile: 'text-[24px] leading-[1.4]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'desktop',
      weight: 'semibold',
    },
  }),

  h4: cva('font-heading', {
    variants: {
      size: {
        desktop: 'text-[24px] leading-[1.4]',
        mobile: 'text-[20px] leading-[1.5]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      size: 'desktop',
      weight: 'semibold',
    },
  }),

  // Body text styles
  body: cva('font-body', {
    variants: {
      size: {
        sm: 'text-sm leading-[1.6]',
        base: 'text-base leading-[1.6]',
        lg: 'text-lg leading-[1.6]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'normal',
    },
  }),

  // Label styles
  label: cva('font-body', {
    variants: {
      size: {
        sm: 'text-sm leading-[1.4]',
        base: 'text-base leading-[1.4]',
        lg: 'text-lg leading-[1.4]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'medium',
    },
  }),

  // Caption styles
  caption: cva('font-body', {
    variants: {
      size: {
        sm: 'text-xs leading-[1.4]',
        base: 'text-sm leading-[1.4]',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'normal',
    },
  }),
};

// Font feature settings
export const fontFeatures = {
  heading: 'font-feature-settings: "ss01", "ss02", "salt";',
  body: 'font-feature-settings: "kern", "liga";',
};

// Line height utilities
export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Letter spacing utilities
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};
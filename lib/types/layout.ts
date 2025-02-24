import { type ReactNode } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { containerVariants } from '@/components/ui/base';

// Basic layout props
export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

// Container sizes from design tokens
export type ContainerSize = 'default' | 'sm' | 'md' | 'lg' | 'content' | 'hero';

// Breakpoint sizes
export type BreakpointSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Spacing sizes
export type SpacingSize = 'sm' | 'md' | 'lg' | 'xl';

// Container props
export interface ContainerProps extends LayoutProps {
  size?: ContainerSize;
}

// Section props
export interface SectionProps extends LayoutProps {
  spacing?: SpacingSize;
  alignment?: 'left' | 'center' | 'right';
}

// Hero section props
export interface HeroProps extends LayoutProps {
  size?: 'default' | 'sm' | 'lg';
  layout?: 'default' | 'left' | 'right';
}

// Page header props
export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

// Page section props
export interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

// Animation props
export interface AnimationProps {
  animate?: boolean;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string;
  };
  variants?: {
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    exit?: Record<string, any>;
  };
}

// Base layout props
export interface BaseLayoutProps extends LayoutProps {
  animate?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
  maxWidth?: ContainerSize;
}

// Layout context type
export interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

// Grid props
export interface GridProps extends LayoutProps {
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: SpacingSize;
}

// Stack props
export interface StackProps extends LayoutProps {
  direction?: 'row' | 'column';
  spacing?: SpacingSize;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
}

// Component variants
export type ContainerVariants = VariantProps<typeof containerVariants>;

// Responsive value type
export type ResponsiveValue<T> = T | Partial<Record<BreakpointSize, T>>;

// Layout theme type
export interface LayoutTheme {
  containerPadding: ResponsiveValue<string>;
  sidebarWidth: string;
  headerHeight: string;
  maxWidth: Record<ContainerSize, string>;
  spacing: Record<SpacingSize, string>;
  breakpoints: Record<BreakpointSize, string>;
}
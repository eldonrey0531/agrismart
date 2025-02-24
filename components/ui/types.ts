import { type VariantProps } from 'class-variance-authority';

// Button Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'default' | 'lg' | 'full';
}

// Card Types
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  variant?: 'default' | 'outline' | 'muted' | 'accent' | 'destructive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: 'none' | 'lift' | 'glow' | 'border';
}

// Container Types
export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'content';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// Grid Types
export interface GridProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto' | 'responsive';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  minWidth?: string;
  maxWidth?: string;
}

// Header Types
export interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent' | 'solid';
  border?: 'none' | 'bottom';
  size?: 'default' | 'sm' | 'lg';
  hideOnScroll?: boolean;
  revealOnScroll?: boolean;
  solidOnScroll?: boolean;
}

// Hero Types
export interface HeroProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  pattern?: 'none' | 'dots' | 'grid' | 'waves';
  animate?: boolean;
  backgroundImage?: string;
  overlay?: boolean;
}

// Link Types
export interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'accent' | 'destructive' | 'inherit';
  size?: 'default' | 'sm' | 'lg';
  underline?: 'none' | 'hover' | 'always';
  weight?: 'normal' | 'medium' | 'semibold';
  external?: boolean;
  showExternalIcon?: boolean;
  prefetch?: boolean;
  scroll?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  'aria-label'?: string;
}

// Navigation Types
export interface NavigationProps {
  logo?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent' | 'floating';
  size?: 'default' | 'sm' | 'lg';
  mobileMenu?: React.ReactNode;
  hideOnScroll?: boolean;
}

// Section Types
export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'accent' | 'inverse';
  pattern?: 'none' | 'dots' | 'grid' | 'waves';
  border?: 'none' | 'top' | 'bottom' | 'both';
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero' | 'content' | 'none';
  containerClassName?: string;
  contentClassName?: string;
}

// Typography Types
export interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export interface TextProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'muted' | 'accent' | 'error' | 'success';
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
}
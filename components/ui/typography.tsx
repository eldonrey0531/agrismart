'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';

const headingVariants = cva(
  'font-heading tracking-tight',
  {
    variants: {
      level: {
        h1: 'text-4xl md:text-5xl lg:text-6xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-2xl md:text-3xl lg:text-4xl',
        h4: 'text-xl md:text-2xl lg:text-3xl',
        h5: 'text-lg md:text-xl',
        h6: 'text-base md:text-lg',
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      level: 'h2',
      weight: 'bold',
      align: 'left',
    },
  }
);

const textVariants = cva(
  '',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-text',
        accent: 'text-accent',
        error: 'text-destructive',
        success: 'text-success',
      },
      leading: {
        none: 'leading-none',
        tight: 'leading-tight',
        snug: 'leading-snug',
        normal: 'leading-normal',
        relaxed: 'leading-relaxed',
        loose: 'leading-loose',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'normal',
      align: 'left',
      variant: 'default',
      leading: 'normal',
    },
  }
);

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends VariantProps<typeof headingVariants> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  level?: HeadingLevel;
}

export function Heading({
  children,
  className,
  level = 'h2',
  weight,
  align,
  id,
}: HeadingProps) {
  const Tag = level as keyof JSX.IntrinsicElements;
  return (
    <Tag
      id={id}
      className={cn(headingVariants({ level, weight, align }), className)}
    >
      {children}
    </Tag>
  );
}

interface TextProps extends VariantProps<typeof textVariants> {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Text({
  children,
  className,
  size,
  weight,
  align,
  variant,
  leading,
  as: Tag = 'p',
}: TextProps) {
  return (
    <Tag
      className={cn(textVariants({ size, weight, align, variant, leading }), className)}
    >
      {children}
    </Tag>
  );
}

// Pre-configured variants
export function Display({ children, className, ...props }: TextProps) {
  return (
    <Text
      size="2xl"
      weight="bold"
      leading="tight"
      className={cn('md:text-5xl lg:text-6xl xl:text-7xl', className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Lead({ children, className, ...props }: TextProps) {
  return (
    <Text
      size="lg"
      variant="muted"
      className={cn('md:text-xl', className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Large({ children, className, ...props }: TextProps) {
  return (
    <Text
      size="lg"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Small({ children, className, ...props }: TextProps) {
  return (
    <Text
      size="sm"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Muted({ children, className, ...props }: TextProps) {
  return (
    <Text
      variant="muted"
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}

export default {
  Heading,
  Text,
  Display,
  Lead,
  Large,
  Small,
  Muted,
};
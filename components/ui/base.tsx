import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/config/design-tokens';

// Container component variants
export const containerVariants = cva(
  'w-full mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      size: {
        default: 'max-w-7xl',
        sm: 'max-w-3xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        content: 'max-w-[640px]',
        hero: 'max-w-[960px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

// Section component variants
export const sectionVariants = cva(
  'w-full py-12 md:py-16 lg:py-24',
  {
    variants: {
      spacing: {
        default: 'gap-8 md:gap-12',
        sm: 'gap-4 md:gap-6',
        lg: 'gap-12 md:gap-16',
      },
      alignment: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
    },
    defaultVariants: {
      spacing: 'default',
      alignment: 'left',
    },
  }
);

// Hero section variants
export const heroVariants = cva(
  'relative overflow-hidden bg-background',
  {
    variants: {
      size: {
        default: 'py-16 md:py-24 lg:py-32',
        sm: 'py-12 md:py-16 lg:py-20',
        lg: 'py-20 md:py-32 lg:py-40',
      },
      layout: {
        default: 'text-center',
        left: 'text-left',
        right: 'text-right',
      },
    },
    defaultVariants: {
      size: 'default',
      layout: 'default',
    },
  }
);

// Button base variants
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-surface text-foreground hover:bg-surface/90',
        accent: 'bg-accent text-foreground-dark hover:bg-accent/90',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'hover:bg-surface hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Components
export interface ContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({ className, size, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}

export interface SectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export function Section({ className, spacing, alignment, ...props }: SectionProps) {
  return (
    <section 
      className={cn(sectionVariants({ spacing, alignment }), className)} 
      {...props} 
    />
  );
}

export interface HeroProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof heroVariants> {}

export function Hero({ className, size, layout, ...props }: HeroProps) {
  return (
    <div 
      className={cn(heroVariants({ size, layout }), className)} 
      {...props} 
    />
  );
}

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ 
  className, 
  variant, 
  size, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

// Text components with nature-inspired design
export const Heading = {
  H1: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 
      className={cn('text-4xl md:text-[64px] font-heading font-bold leading-[1.1] tracking-tight', 
      className)} 
      {...props}
    >
      {children}
    </h1>
  ),
  H2: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 
      className={cn('text-3xl md:text-[48px] font-heading font-semibold leading-[1.2]', 
      className)} 
      {...props}
    >
      {children}
    </h2>
  ),
  H3: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 
      className={cn('text-2xl md:text-[32px] font-heading font-semibold leading-[1.3]', 
      className)} 
      {...props}
    >
      {children}
    </h3>
  ),
};

export const Text = {
  Lead: ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p 
      className={cn('text-xl md:text-2xl text-muted-foreground leading-relaxed', 
      className)} 
      {...props}
    >
      {children}
    </p>
  ),
  Body: ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p 
      className={cn('text-base leading-7', 
      className)} 
      {...props}
    >
      {children}
    </p>
  ),
  Small: ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p 
      className={cn('text-sm text-muted-foreground leading-normal', 
      className)} 
      {...props}
    >
      {children}
    </p>
  ),
};
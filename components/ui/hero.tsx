'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';

const heroVariants = cva(
  'relative w-full flex flex-col items-center justify-center text-center',
  {
    variants: {
      size: {
        default: 'py-16 md:py-24',
        sm: 'py-12 md:py-16',
        lg: 'py-24 md:py-32',
      },
      pattern: {
        none: '',
        dots: 'bg-[var(--pattern-dots)]',
        grid: 'bg-[var(--pattern-grid)]',
        waves: 'bg-[var(--pattern-waves)]',
      },
      overlay: {
        true: 'before:absolute before:inset-0 before:bg-background/60 before:z-0',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      pattern: 'none',
      overlay: false,
    },
  }
);

interface HeroProps extends VariantProps<typeof heroVariants> {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function Hero({
  title,
  description,
  children,
  className,
  size,
  pattern,
  backgroundImage,
  overlay,
}: HeroProps) {
  const containerStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : undefined;

  return (
    <section
      className={cn(heroVariants({ size, pattern, overlay }), className)}
      style={containerStyle}
    >
      <div className="relative z-10 mx-auto max-w-[var(--hero-width)] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-[960px]">
            {title}
          </h1>

          {description && (
            <p className="text-lg text-muted-text md:text-xl max-w-[640px]">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
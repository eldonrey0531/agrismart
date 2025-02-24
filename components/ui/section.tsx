'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';
import { Container } from './container';

const sectionVariants = cva(
  'relative w-full',
  {
    variants: {
      spacing: {
        none: '',
        sm: 'py-8',
        md: 'py-16',
        lg: 'py-24',
        xl: 'py-32',
      },
      background: {
        default: 'bg-background',
        muted: 'bg-muted',
        accent: 'bg-accent text-accent-foreground',
        inverse: 'bg-primary text-primary-foreground',
      },
      pattern: {
        none: '',
        dots: 'bg-[var(--pattern-dots)]',
        grid: 'bg-[var(--pattern-grid)]',
        waves: 'bg-[var(--pattern-waves)]',
      },
      border: {
        none: '',
        top: 'border-t',
        bottom: 'border-b',
        both: 'border-y',
      },
      width: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
        '2xl': '',
        hero: '',
        content: '',
        none: '',
      },
    },
    defaultVariants: {
      spacing: 'md',
      background: 'default',
      pattern: 'none',
      border: 'none',
      width: 'lg',
    },
  }
);

interface SectionProps extends VariantProps<typeof sectionVariants> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  contentClassName?: string;
}

export function Section({
  children,
  className,
  id,
  spacing,
  background,
  pattern,
  border,
  width,
  containerClassName,
  contentClassName,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        sectionVariants({ spacing, background, pattern, border, width }),
        className
      )}
    >
      {width === 'none' ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        <Container
          size={width}
          className={containerClassName}
        >
          <div className={contentClassName}>{children}</div>
        </Container>
      )}
    </section>
  );
}

// Section Header component for consistent headers
const sectionHeaderVariants = cva(
  'flex flex-col gap-4',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center items-center',
        right: 'text-right items-end',
      },
      spacing: {
        none: 'mb-0',
        sm: 'mb-8',
        md: 'mb-12',
        lg: 'mb-16',
      },
    },
    defaultVariants: {
      align: 'left',
      spacing: 'md',
    },
  }
);

interface SectionHeaderProps extends VariantProps<typeof sectionHeaderVariants> {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  children,
  className,
  align,
  spacing,
}: SectionHeaderProps) {
  return (
    <header className={cn(sectionHeaderVariants({ align, spacing }), className)}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-text max-w-[60ch]">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}

export default Section;
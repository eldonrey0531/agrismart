'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';

const containerVariants = cva(
  'mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      size: {
        sm: 'max-w-[640px]',
        md: 'max-w-[768px]',
        lg: 'max-w-[1024px]',
        xl: 'max-w-[1280px]',
        '2xl': 'max-w-[1536px]',
        hero: 'max-w-[960px]',
        content: 'max-w-[640px]',
      },
      padding: {
        none: 'px-0',
        sm: 'py-4',
        md: 'py-8',
        lg: 'py-12',
        xl: 'py-16',
        '2xl': 'py-24',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      spacing: {
        none: 'space-y-0',
        sm: 'space-y-4',
        md: 'space-y-8',
        lg: 'space-y-12',
        xl: 'space-y-16',
      },
    },
    defaultVariants: {
      size: 'lg',
      padding: 'md',
      align: 'left',
      spacing: 'md',
    },
  }
);

interface ContainerProps extends VariantProps<typeof containerVariants> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function Container({
  children,
  className,
  id,
  size,
  padding,
  align,
  spacing,
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      id={id}
      className={cn(
        containerVariants({
          size,
          padding,
          align,
          spacing,
          className,
        })
      )}
    >
      {children}
    </Component>
  );
}

export default Container;
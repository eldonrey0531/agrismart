'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        auto: 'grid-cols-auto-fill',
        responsive: 'grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]',
      },
      gap: {
        none: 'gap-0',
        xs: 'gap-2',
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
      },
    },
    defaultVariants: {
      cols: 'responsive',
      gap: 'md',
      align: 'stretch',
      justify: 'start',
    },
  }
);

interface GridProps extends VariantProps<typeof gridVariants> {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  minWidth?: string;
  maxWidth?: string;
}

export function Grid({
  children,
  className,
  cols,
  gap,
  align,
  justify,
  as: Component = 'div',
  minWidth,
  maxWidth,
}: GridProps) {
  const style = {
    ...(minWidth && { '--min-item-width': minWidth }),
    ...(maxWidth && { '--max-item-width': maxWidth }),
  } as React.CSSProperties;

  return (
    <Component
      className={cn(gridVariants({ cols, gap, align, justify }), className)}
      style={style}
    >
      {children}
    </Component>
  );
}

// Grid Item component for additional control
const gridItemVariants = cva(
  '',
  {
    variants: {
      span: {
        auto: 'col-auto',
        full: 'col-span-full',
        1: 'col-span-1',
        2: 'col-span-1 sm:col-span-2',
        3: 'col-span-1 sm:col-span-2 lg:col-span-3',
        4: 'col-span-1 sm:col-span-2 lg:col-span-4',
      },
      order: {
        first: 'order-first',
        last: 'order-last',
        none: 'order-none',
      },
    },
    defaultVariants: {
      span: 'auto',
      order: 'none',
    },
  }
);

interface GridItemProps extends VariantProps<typeof gridItemVariants> {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function GridItem({
  children,
  className,
  span,
  order,
  as: Component = 'div',
}: GridItemProps) {
  return (
    <Component className={cn(gridItemVariants({ span, order }), className)}>
      {children}
    </Component>
  );
}

export default Grid;
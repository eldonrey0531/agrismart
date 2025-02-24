'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  `
    text-sm font-medium leading-none
    transition-all duration-300
    text-[#E3FFED]/70 
    peer-disabled:cursor-not-allowed 
    peer-disabled:opacity-70
    hover:text-[#38FF7E]
    hover:[filter:drop-shadow(0_0_8px_rgba(56,255,126,0.4))_drop-shadow(0_0_16px_rgba(36,74,50,0.4))]
  `
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

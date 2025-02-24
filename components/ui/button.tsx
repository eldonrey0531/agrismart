'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: `
          premium-button relative overflow-hidden
          bg-gradient-to-r from-[#244A32] via-[#172F21] to-[#244A32]
          text-[#E3FFED] hover:text-[#38FF7E]
          border border-[#38FF7E]/20 hover:border-[#38FF7E]/30
          shadow-lg hover:shadow-xl
          hover:[filter:drop-shadow(0_0_12px_rgba(56,255,126,0.4))_drop-shadow(0_0_20px_rgba(36,74,50,0.4))]
          hover:scale-[1.02]
          group
        `,
        destructive: `
          bg-gradient-to-r from-red-900 to-red-800
          text-white hover:text-red-100
          border border-red-700/20 hover:border-red-700/40
          hover:[filter:drop-shadow(0_0_12px_rgba(239,68,68,0.4))_drop-shadow(0_0_20px_rgba(136,19,55,0.4))]
        `,
        outline: `
          border border-[#38FF7E]/10 hover:border-[#38FF7E]/30
          bg-transparent hover:bg-gradient-to-r hover:from-[#244A32]/20 hover:to-[#172F21]/20
          text-[#E3FFED]/70 hover:text-[#38FF7E]
          hover:[text-shadow:0_0_10px_rgba(56,255,126,0.4),0_0_20px_rgba(36,74,50,0.4)]
        `,
        secondary: `
          bg-gradient-to-r from-[#0E1B13] to-[#172F21]
          text-[#E3FFED]/70 hover:text-[#38FF7E]
          border border-[#38FF7E]/10 hover:border-[#38FF7E]/30
          hover:[text-shadow:0_0_10px_rgba(56,255,126,0.4),0_0_20px_rgba(36,74,50,0.4)]
        `,
        ghost: `
          hover:bg-gradient-to-r hover:from-[#244A32]/20 hover:to-[#172F21]/20
          text-[#E3FFED]/70 hover:text-[#38FF7E]
          hover:[text-shadow:0_0_10px_rgba(56,255,126,0.4),0_0_20px_rgba(36,74,50,0.4)]
        `,
        link: `
          text-[#38FF7E]/80 hover:text-[#38FF7E]
          underline-offset-4 hover:underline
          hover:[text-shadow:0_0_10px_rgba(56,255,126,0.4),0_0_20px_rgba(36,74,50,0.4)]
        `,
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          'relative overflow-hidden'
        )}
        ref={ref}
        {...props}
      >
        {/* Enhanced gradient glow effects */}
        <span className="absolute inset-0 bg-gradient-to-r from-[#38FF7E]/0 via-[#38FF7E]/20 to-[#38FF7E]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="absolute inset-[-1px] bg-gradient-to-r from-[#38FF7E]/0 via-[#38FF7E]/10 to-[#38FF7E]/0 rounded-lg blur-md" />
        </span>
        <span className="relative z-10 group-hover:[text-shadow:0_0_10px_rgba(56,255,126,0.4),0_0_20px_rgba(36,74,50,0.4)]">
          {props.children}
        </span>
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
export default Button;
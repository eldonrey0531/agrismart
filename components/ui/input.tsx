'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg transition-all duration-300",
          // Premium base styles
          "bg-gradient-to-r from-[#244A32]/20 to-[#172F21]/20 backdrop-blur-sm",
          "border border-[#38FF7E]/10",
          "px-3 py-2 text-sm text-[#E3FFED]",
          // File input styles
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholder
          "placeholder:text-[#E3FFED]/30",
          // Focus styles with gradient glow
          "focus-visible:outline-none",
          "focus-visible:border-[#38FF7E]/30",
          "focus-visible:[filter:drop-shadow(0_0_12px_rgba(56,255,126,0.3))_drop-shadow(0_0_20px_rgba(36,74,50,0.3))]",
          "focus-visible:bg-gradient-to-r focus-visible:from-[#244A32]/30 focus-visible:to-[#172F21]/30",
          // Hover styles
          "hover:border-[#38FF7E]/20",
          "hover:[filter:drop-shadow(0_0_8px_rgba(56,255,126,0.2))_drop-shadow(0_0_16px_rgba(36,74,50,0.2))]",
          "hover:bg-gradient-to-r hover:from-[#244A32]/25 hover:to-[#172F21]/25",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:hover:filter-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
export default Input;

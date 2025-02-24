import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
        rounded-lg border border-[#38FF7E]/10
        bg-gradient-to-br from-[#0E1B13]/95 to-[#172F21]/95
        backdrop-blur-sm
        p-6
        shadow-lg
        transition-all duration-300
        hover:border-[#38FF7E]/20
        hover:[filter:drop-shadow(0_0_20px_rgba(36,74,50,0.3))_drop-shadow(0_0_30px_rgba(56,255,126,0.2))]
      `,
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      `
        text-2xl font-semibold leading-none tracking-tight
        text-[#E3FFED]
        transition-all duration-300
        hover:text-[#38FF7E]
        hover:[filter:drop-shadow(0_0_8px_rgba(56,255,126,0.4))_drop-shadow(0_0_16px_rgba(36,74,50,0.4))]
      `,
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      `
        text-sm text-[#E3FFED]/70
        transition-all duration-300
        hover:text-[#38FF7E]
        hover:[filter:drop-shadow(0_0_8px_rgba(56,255,126,0.4))_drop-shadow(0_0_16px_rgba(36,74,50,0.4))]
      `,
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
        flex items-center p-6 pt-0
        border-t border-[#38FF7E]/10
        mt-auto
      `,
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

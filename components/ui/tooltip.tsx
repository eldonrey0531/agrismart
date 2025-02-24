'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';

const tooltipVariants = cva(
  'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: 'bg-popover',
        dark: 'bg-secondary text-secondary-foreground',
        error: 'bg-destructive text-destructive-foreground',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type TooltipVariantProps = VariantProps<typeof tooltipVariants>;

interface BaseTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode;
  children: React.ReactElement;
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
}

interface TooltipProps extends BaseTooltipProps, TooltipVariantProps {}

// TooltipTrigger component
export const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('inline-flex cursor-default', className)}
    {...props}
  />
));
TooltipTrigger.displayName = "TooltipTrigger";

// TooltipContent component
export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

export function Tooltip({
  children,
  content,
  delayDuration = 200,
  side = 'top',
  align = 'center',
  variant,
  size,
  className,
  sideOffset = 4,
  alignOffset = 0,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement>(null);

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (side) {
      case 'top':
        x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.top - tooltipRect.height - sideOffset;
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.bottom + sideOffset;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - sideOffset;
        y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        break;
      case 'right':
        x = triggerRect.right + sideOffset;
        y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        break;
    }

    // Align adjustment
    if (align === 'start') {
      if (side === 'top' || side === 'bottom') {
        x = triggerRect.left + alignOffset;
      }
    } else if (align === 'end') {
      if (side === 'top' || side === 'bottom') {
        x = triggerRect.right - tooltipRect.width - alignOffset;
      }
    }

    // Viewport containment
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8));

    setPosition({ x, y });
  }, [side, align, sideOffset, alignOffset]);

  const showTooltip = React.useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      requestAnimationFrame(calculatePosition);
    }, delayDuration);
  }, [delayDuration, calculatePosition]);

  const hideTooltip = React.useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clonedChild = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  });

  return (
    <>
      {clonedChild}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            tooltipVariants({ variant, size }),
            'fixed pointer-events-none',
            className
          )}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
          {...props}
        >
          {content}
        </div>
      )}
    </>
  );
}

// Pre-configured variants
export function DarkTooltip(props: TooltipProps) {
  return <Tooltip variant="dark" {...props} />;
}

export function ErrorTooltip(props: TooltipProps) {
  return <Tooltip variant="error" {...props} />;
}

export default Object.assign(Tooltip, {
  Dark: DarkTooltip,
  Error: ErrorTooltip,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});

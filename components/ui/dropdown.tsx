'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/design-utils';

const dropdownVariants = cva(
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
  {
    variants: {
      variant: {
        default: '',
        contextMenu: 'w-64',
      },
      size: {
        default: '',
        sm: 'min-w-[6rem]',
        lg: 'min-w-[12rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof dropdownVariants> {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({
    children,
    trigger,
    open,
    onOpenChange,
    className,
    variant,
    size,
    side = 'bottom',
    align = 'start',
    sideOffset = 4,
    alignOffset = 0,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLDivElement>(null);

    const handleClickOutside = React.useCallback((event: MouseEvent) => {
      if (
        dropdownRef.current &&
        triggerRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }, [onOpenChange]);

    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleClickOutside]);

    const handleTriggerClick = () => {
      const newState = !isOpen;
      setIsOpen(newState);
      onOpenChange?.(newState);
    };

    return (
      <div className="relative inline-block">
        <div
          ref={triggerRef}
          onClick={handleTriggerClick}
          className="cursor-pointer"
        >
          {trigger}
        </div>
        {isOpen && (
          <div
            ref={ref}
            className={cn(
              dropdownVariants({ variant, size }),
              'absolute',
              {
                'top-0 right-full': side === 'left',
                'top-0 left-full': side === 'right',
                'bottom-full left-0': side === 'top',
                'top-full left-0': side === 'bottom',
              },
              {
                'left-auto right-0': align === 'end',
                'left-1/2 -translate-x-1/2': align === 'center',
              },
              className
            )}
            style={{
              marginTop: side === 'bottom' ? sideOffset : undefined,
              marginBottom: side === 'top' ? sideOffset : undefined,
              marginLeft: side === 'right' ? sideOffset : alignOffset,
              marginRight: side === 'left' ? sideOffset : undefined,
            }}
            {...props}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

// Dropdown components
const DropdownItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean; inset?: boolean }
>(({ className, children, disabled, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
    data-disabled={disabled}
  >
    {children}
  </div>
));

DropdownItem.displayName = 'DropdownItem';

const DropdownSubmenu = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ children, trigger, className, ...props }, ref) => (
    <Dropdown
      ref={ref}
      trigger={
        <div className="flex items-center justify-between w-full">
          {trigger}
          <ChevronRight className="ml-auto h-4 w-4" />
        </div>
      }
      side="right"
      {...props}
    >
      {children}
    </Dropdown>
  )
);

DropdownSubmenu.displayName = 'DropdownSubmenu';

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));

DropdownSeparator.displayName = 'DropdownSeparator';

export {
  Dropdown,
  DropdownItem,
  DropdownSubmenu,
  DropdownSeparator,
};
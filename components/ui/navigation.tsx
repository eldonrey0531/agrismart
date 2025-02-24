'use client';

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';
import { Menu, X } from 'lucide-react';

const navigationVariants = cva(
  'fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: 'border-b border-border',
        transparent: '',
        floating: 'my-4 rounded-lg border shadow-lg mx-4 lg:mx-8',
      },
      size: {
        default: 'h-16',
        sm: 'h-14',
        lg: 'h-20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface NavigationProps extends VariantProps<typeof navigationVariants> {
  logo?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  mobileMenu?: React.ReactNode;
  hideOnScroll?: boolean;
}

export function Navigation({
  logo,
  children,
  className,
  variant,
  size,
  mobileMenu,
  hideOnScroll,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={cn(navigationVariants({ variant, size }), className)}>
      <div className="mx-auto max-w-[var(--container-width)] h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {children}
          </div>

          {/* Mobile Menu Button */}
          {mobileMenu && (
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-muted-text hover:text-foreground focus:outline-none focus:ring-2 focus:ring-focus"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div
          className={cn(
            'lg:hidden',
            isOpen
              ? 'fixed inset-0 top-[var(--header-height)] bg-background'
              : 'hidden'
          )}
        >
          <div className="px-4 pt-2 pb-6 space-y-1">
            {mobileMenu}
          </div>
        </div>
      )}
    </nav>
  );
}

// Navigation Item
const navigationItemVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-muted-text hover:text-foreground',
        active: 'text-foreground',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface NavigationItemProps extends VariantProps<typeof navigationItemVariants> {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function NavigationItem({
  children,
  className,
  variant,
  size,
  href,
  onClick,
}: NavigationItemProps) {
  const Comp = href ? 'a' : 'button';
  const props = href ? { href } : { onClick };

  return (
    <Comp
      className={cn(navigationItemVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export default Navigation;
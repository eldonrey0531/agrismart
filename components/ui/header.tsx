'use client';

import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/design-utils';
import { Container } from './container';

const headerVariants = cva(
  'fixed top-0 left-0 right-0 z-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        transparent: 'bg-transparent',
        solid: 'bg-background',
      },
      border: {
        none: '',
        bottom: 'border-b border-border',
      },
      size: {
        default: 'h-16',
        sm: 'h-14',
        lg: 'h-20',
      },
    },
    defaultVariants: {
      variant: 'default',
      border: 'bottom',
      size: 'default',
    },
  }
);

interface HeaderProps extends VariantProps<typeof headerVariants> {
  children?: React.ReactNode;
  className?: string;
  hideOnScroll?: boolean;
  revealOnScroll?: boolean;
  solidOnScroll?: boolean;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Header({
  children,
  className,
  variant,
  border,
  size,
  hideOnScroll,
  revealOnScroll,
  solidOnScroll,
  containerSize = 'xl',
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSolid, setIsSolid] = useState(!solidOnScroll);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrolledPastThreshold = currentScrollY > 50;

      // Handle visibility based on scroll direction
      if (hideOnScroll || revealOnScroll) {
        if (scrollingDown && isVisible && scrolledPastThreshold) {
          setIsVisible(false);
        } else if (!scrollingDown && !isVisible) {
          setIsVisible(true);
        }
      }

      // Handle solid background on scroll
      if (solidOnScroll) {
        setIsSolid(scrolledPastThreshold);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, revealOnScroll, solidOnScroll, isVisible, lastScrollY]);

  return (
    <header
      className={cn(
        headerVariants({ variant: isSolid ? 'solid' : variant, border, size }),
        !isVisible && '-translate-y-full',
        'transition-transform duration-300',
        className
      )}
    >
      <Container size={containerSize} className="h-full">
        <div className="flex items-center justify-between h-full">
          {children}
        </div>
      </Container>
    </header>
  );
}

// Header components
export function HeaderLogo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex-shrink-0', className)}>
      {children}
    </div>
  );
}

export function HeaderNav({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <nav className={cn('hidden lg:flex lg:items-center lg:gap-8', className)}>
      {children}
    </nav>
  );
}

export function HeaderActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {children}
    </div>
  );
}

export default Object.assign(Header, {
  Logo: HeaderLogo,
  Nav: HeaderNav,
  Actions: HeaderActions,
});
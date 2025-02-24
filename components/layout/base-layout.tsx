'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { designTokens } from '@/lib/config/design-tokens';
import { cn, prefersReducedMotion } from '@/lib/utils/design-utils';
import { Container } from '@/components/ui/base';
import type { 
  BaseLayoutProps, 
  PageHeaderProps, 
  PageSectionProps,
  ContainerSize
} from '@/lib/types/layout';

export function BaseLayout({
  children,
  className,
  animate = true,
  header,
  footer,
  sidebar,
  maxWidth = 'default',
}: BaseLayoutProps) {
  const shouldReduceMotion = prefersReducedMotion();
  
  const pageTransition = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -20 },
  };

  const contentStyles = cn(
    'min-h-screen flex flex-col',
    sidebar && 'lg:flex-row',
    className
  );

  const mainStyles = cn(
    'flex-1 flex flex-col',
    sidebar && 'lg:ml-64' // Adjust based on your sidebar width
  );

  return (
    <ThemeProvider>
      <div className={contentStyles}>
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {header}
          </header>
        )}

        {/* Sidebar */}
        {sidebar && (
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background lg:block">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className={mainStyles}>
          <Container size={maxWidth as ContainerSize} className="flex-1 py-6 md:py-8 lg:py-12">
            <AnimatePresence mode="wait">
              {animate ? (
                <motion.div
                  key="content"
                  initial={pageTransition.initial}
                  animate={pageTransition.animate}
                  exit={pageTransition.exit}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.3,
                    ease: 'easeInOut',
                  }}
                >
                  {children}
                </motion.div>
              ) : (
                children
              )}
            </AnimatePresence>
          </Container>
        </main>

        {/* Footer */}
        {footer && (
          <footer className="border-t border-border bg-background">
            {footer}
          </footer>
        )}
      </div>
    </ThemeProvider>
  );
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8 md:mb-12', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageSection({
  title,
  description,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default BaseLayout;
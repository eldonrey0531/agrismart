'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/design-utils';
import { Container } from '@/components/ui/base';

const menuItems = [
  {
    title: 'Overview',
    href: '/design-system',
    description: 'Introduction to the design system',
  },
  {
    title: 'Colors',
    href: '/design-system#colors',
    description: 'Color palette and usage guidelines',
  },
  {
    title: 'Typography',
    href: '/design-system#typography',
    description: 'Font scales and text styles',
  },
  {
    title: 'Components',
    href: '/design-system#components',
    description: 'UI component library',
  },
  {
    title: 'Patterns',
    href: '/design-system#patterns',
    description: 'Common UI patterns and layouts',
  },
  {
    title: 'Motion',
    href: '/design-system#motion',
    description: 'Animation and transitions',
  },
] as const;

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">Design System</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:space-x-6">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </Container>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden"
          >
            <nav className="border-b border-border bg-background">
              <Container>
                <div className="grid gap-4 py-4">
                  {menuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="group grid gap-1 p-4 hover:bg-accent/5 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-sm font-medium group-hover:text-accent">
                        {item.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    </a>
                  ))}
                </div>
              </Container>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <Container>
          <div className="py-8 text-center text-sm text-muted-foreground">
            <p>Nature-Inspired Design System • Version 1.0.0</p>
            <p className="mt-2">
              Built with <span className="text-accent">♥</span> using Next.js and
              Tailwind CSS
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
'use client';

import React from 'react';
import { Container } from '@/components/ui/base';

export default function DesignSystemLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Container className="py-16">
        {/* Skeleton for Hero section */}
        <div className="space-y-8 animate-pulse">
          {/* Title skeleton */}
          <div className="w-3/4 h-16 bg-surface rounded-lg mx-auto" />
          
          {/* Description skeleton */}
          <div className="w-2/3 h-8 bg-surface rounded-lg mx-auto" />
          
          {/* Buttons skeleton */}
          <div className="flex justify-center gap-4">
            <div className="w-32 h-12 bg-surface rounded-md" />
            <div className="w-32 h-12 bg-surface rounded-md" />
          </div>
        </div>

        {/* Skeleton for Color section */}
        <div className="mt-24 space-y-8">
          <div className="w-48 h-10 bg-surface rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="w-32 h-8 bg-surface rounded-lg" />
                <div className="grid gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-surface rounded-md" />
                      <div className="space-y-2">
                        <div className="w-24 h-6 bg-surface rounded" />
                        <div className="w-16 h-4 bg-surface rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton for Typography section */}
        <div className="mt-24 space-y-8">
          <div className="w-48 h-10 bg-surface rounded-lg" />
          <div className="space-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div 
                  className={`bg-surface rounded-lg ${
                    i === 0 ? 'w-3/4 h-16' : 
                    i === 1 ? 'w-2/3 h-14' : 
                    i === 2 ? 'w-1/2 h-12' : 
                    'w-full h-24'
                  }`}
                />
                <div className="w-32 h-4 bg-surface rounded" />
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Accessibility note */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading design system content...
      </div>
    </div>
  );
}

// Optional: Add error boundary
export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Container className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Error Loading Design System
        </h2>
        <p className="text-muted-foreground mb-8">
          There was an error loading the design system content. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Retry
        </button>
      </Container>
    </div>
  );
}
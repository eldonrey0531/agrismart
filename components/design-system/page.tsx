'use client';

import React from 'react';
import { Button } from '@/components/ui/base';
import { Hero } from '@/components/ui/hero';
import { designTokens } from '@/lib/config/design-tokens';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Example */}
      <Hero
        title="Nature-Inspired Design System"
        description="A premium design system that draws inspiration from the natural world, combining organic shapes, earthy colors, and fluid animations to create a harmonious user experience."
        pattern="waves"
        alignment="center"
        containerSize="hero"
      >
        <Button
          size="lg"
          className="bg-accent text-foreground-dark hover:bg-accent/90"
        >
          Explore Components
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-foreground-dark"
        >
          View Documentation
        </Button>
      </Hero>

      {/* Color Palette Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Primary Colors */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium mb-4">Primary Colors</h3>
              <div className="grid gap-4">
                <ColorSwatch
                  name="Background"
                  color={designTokens.colors.primary.background}
                />
                <ColorSwatch
                  name="Surface"
                  color={designTokens.colors.primary.surface}
                />
                <ColorSwatch
                  name="Primary"
                  color={designTokens.colors.primary.base}
                />
              </div>
            </div>

            {/* Secondary Colors */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium mb-4">Secondary Colors</h3>
              <div className="grid gap-4">
                <ColorSwatch
                  name="Accent"
                  color={designTokens.colors.secondary.accent}
                />
                <ColorSwatch
                  name="Interactive"
                  color={designTokens.colors.secondary.interactive}
                />
                <ColorSwatch
                  name="Success"
                  color={designTokens.colors.secondary.success}
                />
              </div>
            </div>

            {/* Support Colors */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium mb-4">Support Colors</h3>
              <div className="grid gap-4">
                <ColorSwatch
                  name="Border"
                  color={designTokens.colors.support.border}
                />
                <ColorSwatch
                  name="Muted"
                  color={designTokens.colors.support.mutedText}
                />
                <ColorSwatch
                  name="Text"
                  color={designTokens.colors.support.lightText}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8">Typography</h2>
          <div className="space-y-8">
            <div>
              <h1 className="text-7xl font-heading font-bold mb-2">Heading 1</h1>
              <p className="text-muted-foreground">Font: Inter, 64px, Bold</p>
            </div>
            <div>
              <h2 className="text-6xl font-heading font-semibold mb-2">
                Heading 2
              </h2>
              <p className="text-muted-foreground">Font: Inter, 48px, Semibold</p>
            </div>
            <div>
              <h3 className="text-5xl font-heading font-semibold mb-2">
                Heading 3
              </h3>
              <p className="text-muted-foreground">Font: Inter, 32px, Semibold</p>
            </div>
            <div>
              <p className="text-xl leading-relaxed mb-2">
                Body text example - The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-muted-foreground">
                Font: System, 20px, Regular, 1.6 Line Height
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center space-x-4">
      <div
        className="w-16 h-16 rounded-md"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{color}</p>
      </div>
    </div>
  );
}
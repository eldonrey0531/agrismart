"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Sprout, SunDim } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Nature-inspired decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated leaves */}
        <div className="absolute top-1/4 left-1/4 animate-float-slow">
          <Leaf className="w-8 h-8 text-accent/40" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-float-reverse">
          <Sprout className="w-10 h-10 text-primary/40" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 animate-pulse-slow">
          <SunDim className="w-12 h-12 text-interactive/30" />
        </div>
      </div>

      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full 
          bg-gradient-to-br from-primary/20 via-accent/20 to-transparent 
          blur-[100px] animate-rotate-slow"
        />
        <div 
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full 
          bg-gradient-to-tr from-interactive/20 via-success/20 to-transparent 
          blur-[100px] animate-rotate-reverse"
        />
      </div>

      {/* Main content */}
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-6 items-center">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Tagline */}
            <div className="inline-block animate-fade-in">
              <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm 
                font-medium bg-accent/10 text-accent transition-transform hover:scale-105">
                <Sprout className="mr-2 h-4 w-4" />
                Empowering Sustainable Agriculture
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold 
              tracking-tight animate-fade-in [animation-delay:200ms]">
              Grow{" "}
              <span className="text-gradient bg-gradient-to-r from-interactive via-accent to-success">
                Smarter
              </span>
              ,<br /> Farm{" "}
              <span className="text-gradient bg-gradient-to-r from-success via-accent to-interactive">
                Better
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-[42rem] mx-auto text-lg sm:text-xl text-muted-text 
              leading-relaxed animate-fade-in [animation-delay:400ms]">
              Transform your farming practices with smart technology. Monitor, analyze,
              and optimize your agricultural operations for sustainable growth and
              better yields.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 
              animate-fade-in [animation-delay:600ms]">
              <Button
                size="lg"
                className="h-12 px-8 bg-primary hover:bg-primary/90 
                  transition-transform hover:scale-105"
                asChild
              >
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-border hover:bg-surface
                  transition-transform hover:scale-105"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
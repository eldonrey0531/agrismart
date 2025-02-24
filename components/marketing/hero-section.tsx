"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Sprout, SunDim } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      ref={heroRef}
      className={cn(
        "relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-20",
        className
      )}
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Leaves Animation */}
        <div 
          className={cn(
            "absolute top-1/4 left-1/4 transition-all duration-1000 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Leaf className="w-8 h-8 text-accent/40 animate-float-slow" />
        </div>
        <div 
          className={cn(
            "absolute top-1/3 right-1/3 transition-all duration-1000 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Sprout className="w-10 h-10 text-primary/40 animate-float-reverse" />
        </div>
        <div 
          className={cn(
            "absolute bottom-1/4 right-1/4 transition-all duration-1000 delay-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <SunDim className="w-12 h-12 text-interactive/30 animate-pulse-slow" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 relative z-10">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          {/* Tagline */}
          <div 
            className={cn(
              "inline-block transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-accent/10 text-accent">
              <Sprout className="mr-2 h-4 w-4" />
              Empowering Sustainable Agriculture
            </span>
          </div>

          {/* Headline */}
          <h1 
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-tight transition-all duration-700 delay-150",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Cultivate{" "}
            <span className="text-gradient bg-gradient-to-r from-interactive via-accent to-success">
              Success
            </span>
            {" "}with Smart{" "}
            <span className="text-gradient bg-gradient-to-r from-success via-accent to-interactive">
              Technology
            </span>
          </h1>

          {/* Description */}
          <p 
            className={cn(
              "text-lg sm:text-xl text-muted-text leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Transform your agricultural practices with data-driven insights and sustainable solutions. 
            Monitor, analyze, and optimize your operations for better yields and a greener future.
          </p>

          {/* CTA Buttons */}
          <div 
            className={cn(
              "flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Button
              size="lg"
              variant="accent"
              className="group"
              asChild
            >
              <Link href="/signup">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group"
              asChild
            >
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div 
            className={cn(
              "grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 mt-12 border-t border-border transition-all duration-700 delay-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {[
              { label: "Active Farms", value: "10,000+" },
              { label: "Yield Increase", value: "25%" },
              { label: "Sustainability Score", value: "95%" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-interactive to-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-text mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
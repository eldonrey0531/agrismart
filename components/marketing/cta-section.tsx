"use client";

import { useIntersection } from "@/hooks/use-intersection";
import { Button } from "@/components/ui/button";
import { Leaf, Sprout, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BackgroundPattern } from "@/components/ui/background-pattern";

export function CTASection() {
  const [sectionRef, isInView] = useIntersection<HTMLElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      {/* Natural Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/20 to-transparent" />
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-success/20 to-transparent" />
        </div>

        {/* Animated Leaves */}
        <div className="absolute inset-0">
          <Leaf 
            className={cn(
              "absolute top-12 left-[15%] w-6 h-6 text-accent/30 transition-all duration-1000 animate-float-slow",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
            )}
          />
          <Sprout 
            className={cn(
              "absolute bottom-12 right-[15%] w-6 h-6 text-success/30 transition-all duration-1000 animate-float-reverse",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          />
        </div>

        {/* Natural Pattern */}
        <BackgroundPattern />
      </div>

      <div className="container px-4 relative">
        <div 
          className={cn(
            "max-w-4xl mx-auto text-center transition-all duration-1000",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Main Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold mb-6">
            Ready to Grow{" "}
            <span className="text-gradient bg-gradient-to-r from-accent via-interactive to-success">
              Sustainably
            </span>
            ?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-text mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who are transforming their agricultural practices
            with AgriSmart's innovative technology solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="default"
              className="h-12 px-8 group"
              asChild
            >
              <Link href="/signup">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 group"
              asChild
            >
              <Link href="/contact">
                Talk to an Expert
                <Sprout className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div 
            className={cn(
              "mt-12 pt-12 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-8 text-center transition-all duration-1000 delay-200",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {[
              { label: "Satisfied Farmers", value: "10,000+" },
              { label: "Hectares Optimized", value: "50,000+" },
              { label: "Sustainability Score", value: "95%" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold text-gradient bg-gradient-to-r from-interactive to-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-text">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full transform rotate-180"
          fill="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="currentColor"
            className="text-background/5"
          />
        </svg>
      </div>
    </section>
  );
}

export default CTASection;
"use client";

import { useIntersection } from "@/hooks/use-intersection";
import {
  Sprout,
  BarChart3,
  CloudSun,
  Droplets,
  Leaf,
  Share2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Smart Monitoring",
    description: "Track soil health, moisture levels, and crop growth in real-time with IoT sensors.",
    icon: Smartphone,
    gradient: "from-interactive to-accent",
  },
  {
    title: "Weather Integration",
    description: "Make informed decisions with accurate weather forecasts and historical patterns.",
    icon: CloudSun,
    gradient: "from-accent to-success",
  },
  {
    title: "Resource Optimization",
    description: "Optimize water and nutrient usage with AI-powered recommendations.",
    icon: Droplets,
    gradient: "from-success to-interactive",
  },
  {
    title: "Yield Analytics",
    description: "Analyze crop performance and predict yields with advanced data analytics.",
    icon: BarChart3,
    gradient: "from-primary to-accent",
  },
  {
    title: "Sustainable Practices",
    description: "Implement eco-friendly farming methods and track environmental impact.",
    icon: Leaf,
    gradient: "from-accent to-interactive",
  },
  {
    title: "Community Insights",
    description: "Share knowledge and learn from other farmers in your region.",
    icon: Share2,
    gradient: "from-interactive to-success",
  },
  {
    title: "Crop Protection",
    description: "Early detection of pests and diseases with AI-powered image analysis.",
    icon: ShieldCheck,
    gradient: "from-success to-primary",
  },
  {
    title: "Growth Tracking",
    description: "Monitor crop development stages and optimize harvest timing.",
    icon: Sprout,
    gradient: "from-primary to-interactive",
  },
];

export function FeaturesSection() {
  const [sectionRef, isInView] = useIntersection<HTMLElement>({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden bg-surface/50"
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(74, 103, 65, 0.3) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="container px-4 relative">
        {/* Section Header */}
        <div 
          className={cn(
            "text-center max-w-2xl mx-auto mb-16 transition-all duration-700",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
            Grow Smarter with
            <span className="text-gradient bg-gradient-to-r from-accent via-interactive to-success ml-2">
              AgriSmart
            </span>
          </h2>
          <p className="text-muted-text text-lg">
            Discover how our innovative features can transform your farming practices
            and boost productivity while maintaining sustainability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "relative group p-6 rounded-lg border border-border",
                "bg-background/50 backdrop-blur-sm transition-all duration-500",
                "hover:border-accent/50 hover:bg-accent/5",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{
                transitionDelay: `${150 * (index % 4)}ms`,
              }}
            >
              {/* Feature Icon */}
              <div 
                className={cn(
                  "inline-flex p-3 rounded-lg mb-4",
                  "bg-gradient-to-br bg-opacity-10 transition-transform",
                  "group-hover:scale-110 duration-300",
                  feature.gradient
                )}
              >
                <feature.icon className="w-6 h-6 text-light-text" />
              </div>

              {/* Feature Content */}
              <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-text text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div 
                className="absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 
                  group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
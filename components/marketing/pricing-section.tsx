"use client";

import { useIntersection } from "@/hooks/use-intersection";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  TreePine,
  Trees,
  Check,
  HelpCircle,
  LeafyGreen,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BackgroundPattern } from "@/components/ui/background-pattern";

const plans = [
  {
    name: "Seedling",
    description: "Perfect for small farms getting started with smart agriculture",
    icon: Sprout,
    price: 29,
    period: "month",
    highlight: "Most Popular",
    color: "accent",
    features: [
      { text: "Up to 5 IoT sensors", tooltip: "Monitor soil, weather, and water sensors" },
      { text: "Basic analytics dashboard", tooltip: "View key metrics and trends" },
      { text: "7-day data history", tooltip: "Access recent historical data" },
      { text: "Email support", tooltip: "Get help via email within 24 hours" },
      { text: "Mobile app access", tooltip: "Monitor your farm on the go" },
    ],
  },
  {
    name: "Growth",
    description: "Ideal for medium-sized farms ready to scale operations",
    icon: TreePine,
    price: 89,
    period: "month",
    color: "interactive",
    features: [
      { text: "Up to 20 IoT sensors", tooltip: "Expand monitoring coverage" },
      { text: "Advanced analytics", tooltip: "AI-powered insights and predictions" },
      { text: "30-day data history", tooltip: "Extended historical analysis" },
      { text: "Priority support", tooltip: "Get help within 4 hours" },
      { text: "Team collaboration", tooltip: "Add up to 5 team members" },
      { text: "Custom alerts", tooltip: "Set personalized notification rules" },
    ],
  },
  {
    name: "Ecosystem",
    description: "For large agricultural operations needing comprehensive solutions",
    icon: Trees,
    price: 249,
    period: "month",
    color: "success",
    features: [
      { text: "Unlimited IoT sensors", tooltip: "Monitor your entire operation" },
      { text: "Enterprise analytics", tooltip: "Advanced AI and machine learning insights" },
      { text: "Unlimited history", tooltip: "Full historical data access" },
      { text: "24/7 dedicated support", tooltip: "Immediate assistance anytime" },
      { text: "Unlimited team members", tooltip: "Collaborate across your organization" },
      { text: "Custom integration", tooltip: "Connect with your existing systems" },
      { text: "API access", tooltip: "Build custom solutions" },
    ],
  },
];

export function PricingSection() {
  const [sectionRef, isInView] = useIntersection<HTMLElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden"
    >
      {/* Natural Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0">
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/5 to-transparent" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-success/5 to-transparent" />
          
          {/* Dot Pattern */}
          <BackgroundPattern />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <LeafyGreen className="absolute top-12 left-8 w-8 h-8 text-accent/20 animate-float-slow" />
        <Sprout className="absolute bottom-12 right-8 w-8 h-8 text-success/20 animate-float-reverse" />
      </div>

      <div className="container px-4 relative">
        {/* Section Header */}
        <div 
          className={cn(
            "text-center max-w-2xl mx-auto mb-16 transition-all duration-700",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
            Simple,{" "}
            <span className="text-gradient bg-gradient-to-r from-accent via-interactive to-success">
              Sustainable
            </span>
            {" "}Pricing
          </h2>
          <p className="text-muted-text text-lg">
            Choose the perfect plan for your agricultural needs.
            All plans include our core features to help you grow sustainably.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-8 rounded-lg border border-border",
                "bg-background/50 backdrop-blur-sm",
                "transition-all duration-700 transform hover:border-accent/50",
                "hover:shadow-lg hover:shadow-accent/5",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                plan.highlight && "border-accent ring-2 ring-accent/20"
              )}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Plan Icon */}
              <div className={cn(
                "inline-flex p-3 rounded-lg mb-4 transition-transform group-hover:scale-110",
                `bg-${plan.color}/10 text-${plan.color}`
              )}>
                <plan.icon className="w-6 h-6" />
              </div>

              {/* Plan Details */}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-muted-text text-sm mb-6">{plan.description}</p>

              {/* Pricing */}
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-text">/{plan.period}</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                    {feature.tooltip && (
                      <Tooltip content={feature.tooltip}>
                        <button type="button" className="inline-flex">
                          <HelpCircle className="w-4 h-4 text-muted-text shrink-0 cursor-help" />
                        </button>
                      </Tooltip>
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className="w-full group"
                variant={plan.highlight ? "default" : "outline"}
                size="lg"
              >
                Get Started
                <Sprout className="ml-2 h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>

              {/* Highlight Label */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-background text-sm font-medium rounded-full">
                  {plan.highlight}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
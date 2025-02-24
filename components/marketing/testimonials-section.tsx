"use client";

import { useIntersection } from "@/hooks/use-intersection";
import { Leaf, Star, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Organic Farm Owner",
    image: "/testimonials/sarah.jpg",
    content: "AgriSmart has revolutionized how we manage our organic farm. The smart monitoring system helped us reduce water usage by 40% while improving crop yields.",
    rating: 5,
    highlight: "40% water reduction",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Agricultural Consultant",
    image: "/testimonials/michael.jpg",
    content: "The data analytics and predictive insights have been game-changing for our clients. We're seeing consistent yield improvements across different crop types.",
    rating: 5,
    highlight: "Consistent yield improvements",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Sustainable Farming Advocate",
    image: "/testimonials/emma.jpg",
    content: "What stands out about AgriSmart is their commitment to sustainability. The platform has helped us implement and track eco-friendly practices effectively.",
    rating: 5,
    highlight: "Eco-friendly tracking",
  },
];

export function TestimonialsSection() {
  const [sectionRef, isInView] = useIntersection<HTMLElement>({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden"
    >
      {/* Natural Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Decorative Leaves */}
      <div 
        className={cn(
          "absolute -left-4 top-1/4 transition-all duration-1000 transform",
          isInView ? "opacity-30 translate-x-0" : "opacity-0 -translate-x-8"
        )}
      >
        <Leaf className="w-8 h-8 text-accent animate-float-slow" />
      </div>
      <div 
        className={cn(
          "absolute -right-4 bottom-1/4 transition-all duration-1000 transform",
          isInView ? "opacity-30 translate-x-0" : "opacity-0 translate-x-8"
        )}
      >
        <Leaf className="w-8 h-8 text-primary animate-float-reverse" />
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
            Trusted by Leading
            <span className="text-gradient bg-gradient-to-r from-accent to-success ml-2">
              Farmers
            </span>
          </h2>
          <p className="text-muted-text text-lg">
            Discover how agricultural professionals are transforming their operations
            with AgriSmart's innovative solutions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "relative p-6 rounded-lg border border-border",
                "bg-background/50 backdrop-blur-sm",
                "transition-all duration-700 transform",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-accent/20" />

              {/* Content */}
              <div className="mb-6">
                <p className="text-muted-text italic relative">
                  "{testimonial.content}"
                </p>
                <div className="mt-4 font-semibold text-accent">
                  {testimonial.highlight}
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-text">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="absolute bottom-6 right-6 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-interactive text-interactive"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
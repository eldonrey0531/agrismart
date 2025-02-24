'use client';

import { useState, useEffect } from 'react';
import { getRandomTestimonial } from '@/lib/content/testimonials';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialsCarouselProps {
  interval?: number; // Time in milliseconds between auto-transitions
  className?: string;
}

export function TestimonialsCarousel({
  interval = 8000, // Default to 8 seconds
  className,
}: TestimonialsCarouselProps) {
  const [testimonials, setTestimonials] = useState(() => [
    getRandomTestimonial(),
    getRandomTestimonial(),
    getRandomTestimonial(),
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, interval, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((current) => {
      const newIndex = (current - 1 + testimonials.length) % testimonials.length;
      // Add new testimonial when we loop back to the end
      if (newIndex === testimonials.length - 1) {
        setTestimonials((prev) => [...prev, getRandomTestimonial()]);
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((current) => {
      const newIndex = (current + 1) % testimonials.length;
      // Add new testimonial when we reach the last one
      if (newIndex === testimonials.length - 1) {
        setTestimonials((prev) => [...prev, getRandomTestimonial()]);
      }
      return newIndex;
    });
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.author}-${index}`}
                  className="w-full flex-shrink-0 px-4"
                >
                  <blockquote className="space-y-2">
                    <p className="text-lg">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <footer className="text-sm text-muted-foreground">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p>{testimonial.role}</p>
                      {testimonial.company && (
                        <p className="text-xs">{testimonial.company}</p>
                      )}
                    </footer>
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                aria-label="Previous testimonial"
              >
                <Icons.chevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                aria-label="Next testimonial"
              >
                <Icons.chevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              aria-label={isAutoPlaying ? 'Pause' : 'Play'}
            >
              {isAutoPlaying ? (
                <Icons.pause className="h-4 w-4" />
              ) : (
                <Icons.play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Example:
 * 
 * <TestimonialsCarousel
 *   interval={5000} // Optional: custom interval in milliseconds
 *   className="mt-8" // Optional: additional classes
 * />
 */
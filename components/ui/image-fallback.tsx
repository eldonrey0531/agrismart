'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getBlurDataURL } from '@/lib/utils/placeholder-image';
import { useReducedMotion } from '@/hooks/use-animation-system';

interface ImageFallbackProps extends Omit<ImageProps, 'onError' | 'onLoadingComplete'> {
  fallback?: string;
  showLoadingIndicator?: boolean;
}

export function ImageFallback({
  src,
  alt,
  fallback,
  className,
  showLoadingIndicator = true,
  ...props
}: ImageFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Default fallback image if none provided
  const fallbackSrc = fallback || `https://placehold.co/${props.width}x${props.height}/F3F4F6/94A3B8?text=No+Image`;

  const transitionDuration = prefersReducedMotion ? '0ms' : '300ms';

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg bg-muted/10',
        className
      )}
      style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined }}
    >
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        {...props}
        className={cn(
          'object-cover will-change-transform',
          loading 
            ? 'scale-110 blur-sm' 
            : 'scale-100 blur-0',
          'transition-all duration-300 ease-out motion-safe:transform motion-reduce:transition-none'
        )}
        onError={() => setError(true)}
        onLoadingComplete={() => setLoading(false)}
        placeholder="blur"
        blurDataURL={getBlurDataURL()}
      />

      {/* Loading indicator */}
      {showLoadingIndicator && loading && (
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-background/50',
            'transition-opacity duration-300',
            loading ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full border-2 border-primary opacity-20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 text-muted-foreground backdrop-blur-sm"
          role="alert"
          aria-label="Failed to load image"
        >
          <svg
            className="h-8 w-8 mb-2 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="text-sm font-medium">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

export function ImageFallbackGroup({
  images,
  ...props
}: {
  images: string[];
} & Omit<ImageFallbackProps, 'src' | 'alt'>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, prefersReducedMotion ? 0 : 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, prefersReducedMotion]);

  return (
    <div className="relative group">
      <div className={cn(
        'transition-opacity duration-300',
        isTransitioning ? 'opacity-80' : 'opacity-100'
      )}>
        <ImageFallback
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          {...props}
        />
      </div>

      {/* Navigation dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                index === currentIndex
                  ? 'bg-primary'
                  : 'bg-primary/30 hover:bg-primary/50'
              )}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                }
              }}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full',
              'bg-background/80 backdrop-blur-sm flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            onClick={handlePrev}
            disabled={isTransitioning}
            aria-label="Previous image"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full',
              'bg-background/80 backdrop-blur-sm flex items-center justify-center',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next image"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
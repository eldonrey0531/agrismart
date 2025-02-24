'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onValueChange: (value: number[]) => void;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, min, max, step = 1, disabled = false, onValueChange, className }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const getPercentage = (value: number) => {
      return ((value - min) / (max - min)) * 100;
    };

    const handleMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      
      const rect = sliderRef.current?.getBoundingClientRect();
      if (!rect) return;

      const handleMove = (e: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = (clientX - rect.left) / rect.width;
        const newValue = Math.round(min + position * (max - min));
        
        onValueChange([
          value[0],
          Math.max(Math.min(newValue, max), Math.max(min, value[0])),
        ]);
      };

      const handleUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
      };

      setIsDragging(true);
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleUp);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
      >
        <div
          ref={sliderRef}
          className={cn(
            'relative h-1.5 w-full rounded-full bg-primary/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{
              left: `${getPercentage(value[0])}%`,
              right: `${100 - getPercentage(value[1])}%`,
            }}
          />
          <div
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              isDragging && 'cursor-grabbing',
              !disabled && 'cursor-grab'
            )}
            style={{
              left: `${getPercentage(value[0])}%`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[0]}
            tabIndex={disabled ? -1 : 0}
          />
          <div
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              isDragging && 'cursor-grabbing',
              !disabled && 'cursor-grab'
            )}
            style={{
              left: `${getPercentage(value[1])}%`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[1]}
            tabIndex={disabled ? -1 : 0}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };

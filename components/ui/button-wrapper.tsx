import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';

interface ButtonWrapperProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: () => void;
  asChild?: boolean;
  loading?: boolean;
  onClickHandler?: () => void | Promise<void>;
  children: React.ReactNode;
}

export const ButtonWrapper = React.forwardRef<HTMLButtonElement, ButtonWrapperProps>(
  ({ children, loading, onClick, onClickHandler, ...props }, ref) => {
    const handleClick = async () => {
      if (loading) return;
      
      try {
        // Handle both sync and async click handlers
        if (onClickHandler) {
          await onClickHandler();
        } else if (onClick) {
          onClick();
        }
      } catch (error) {
        console.error('Button click error:', error);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

ButtonWrapper.displayName = 'ButtonWrapper';
'use client';

import { Button } from '@/components/ui/button';

interface RetryButtonProps {
  onRetry: () => void;
}

export function RetryButton({ onRetry }: RetryButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onRetry}
    >
      Try again
    </Button>
  );
}
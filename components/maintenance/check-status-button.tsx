'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export function CheckStatusButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.location.reload()}
    >
      <Icons.refresh className="mr-2 h-4 w-4" />
      Check Status
    </Button>
  );
}
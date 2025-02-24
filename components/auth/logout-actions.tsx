'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface LogoutActionsProps {
  isLoading: boolean;
  onLogout: () => void;
  onCancel: () => void;
}

export function LogoutActions({ isLoading, onLogout, onCancel }: LogoutActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={onLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          'Sign out'
        )}
      </Button>
    </div>
  );
}
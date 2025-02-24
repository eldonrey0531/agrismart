'use client';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface LoginButtonGroupProps {
  isLoading: boolean;
  onOAuthLogin: (provider: string) => void;
}

export function LoginButtonGroup({ isLoading, onOAuthLogin }: LoginButtonGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => onOAuthLogin('google')}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => onOAuthLogin('github')}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.github className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  );
}
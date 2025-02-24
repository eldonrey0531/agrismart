'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useAsync } from '@/hooks/use-async';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { Icons } from '@/components/ui/icons';

interface LogoutDialogContentProps {
  onClose: () => void;
}

export function LogoutDialogContent({ onClose }: LogoutDialogContentProps) {
  const { logout } = useAuth();
  const router = useRouter();
  
  const { execute: executeLogout, isLoading } = useAsync(logout, {
    onSuccess: () => {
      onClose();
      router.push('/login');
    },
    successMessage: 'Logged out successfully',
  });

  return (
    <div className="flex justify-end space-x-2 pt-4">
      <ButtonWrapper
        variant="outline"
        onClickHandler={onClose}
      >
        Cancel
      </ButtonWrapper>
      <ButtonWrapper
        variant="destructive"
        onClickHandler={() => executeLogout()}
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
      </ButtonWrapper>
    </div>
  );
}
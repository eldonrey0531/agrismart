'use client';

import { useState } from 'react';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { Icons } from '@/components/ui/icons';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { LogoutDialogContent } from './logout-dialog-content';

export function LogoutDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DialogWrapper
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Sign Out"
      trigger={
        <ButtonWrapper variant="outline">
          <Icons.logout className="mr-2 h-4 w-4" />
          Sign out
        </ButtonWrapper>
      }
    >
      <p className="py-4 text-sm text-muted-foreground">
        Are you sure you want to sign out? You will need to sign in again to access your account.
      </p>
      <LogoutDialogContent onClose={() => setIsOpen(false)} />
    </DialogWrapper>
  );
}
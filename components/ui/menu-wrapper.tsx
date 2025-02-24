'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface MenuWrapperProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function MenuWrapper({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'end',
  side = 'bottom',
}: MenuWrapperProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        className="w-56"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
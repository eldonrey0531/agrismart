'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/ui/icons';
import { getNavigation } from '@/lib/navigation/config';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';

interface MobileNavProps {
  children?: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || 'guest';

  // Get navigation items for user role
  const navItems = getNavigation(userRole);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Icons.chevronRight className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <div className="px-7">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <Icons.logo className="mr-2 h-4 w-4" />
            <span className="font-bold">AgriSmart</span>
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <div key={item.href} className="flex flex-col space-y-3 pt-6">
                <h4 className="font-medium">{item.title}</h4>
                {item.children ? (
                  <div className="grid grid-flow-row auto-rows-max text-sm">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex w-full items-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                          pathname === child.href && 'bg-accent text-accent-foreground'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {child.title}
                        {pathname === child.href && (
                          <Icons.check className="ml-auto h-4 w-4" />
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex w-full items-center rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground',
                      pathname === item.href && 'bg-accent text-accent-foreground'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                    {pathname === item.href && (
                      <Icons.check className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
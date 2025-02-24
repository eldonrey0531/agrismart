'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { getNavigation } from '@/lib/navigation/config';
import type { UserRole } from '@/types/auth';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

interface NavBarProps {
  className?: string;
}

export function NavBar({ className }: NavBarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || 'guest';
  
  // Get navigation items for user role
  const navItems = getNavigation(userRole);

  return (
    <NavigationMenu className={cn('relative', className)}>
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            {item.children ? (
              // Dropdown menu for items with children
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none transition-colors hover:bg-accent',
                            pathname === item.href && 'bg-accent'
                          )}
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            {item.title}
                          </div>
                          {item.description && (
                            <p className="text-sm leading-tight text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.href}
                            className={cn(
                              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                              pathname === child.href && 'bg-accent text-accent-foreground'
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              {child.title}
                            </div>
                            {child.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {child.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              // Single menu item
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname === item.href && 'bg-accent text-accent-foreground',
                    'cursor-pointer transition-colors'
                  )}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>

      {/* Active indicator line */}
      <div className="absolute -bottom-px left-0 h-[2px] w-full">
        <div
          className={cn(
            'h-full bg-primary transition-all duration-300',
            'relative after:absolute after:bottom-0 after:left-0 after:h-full after:w-full after:bg-primary/20 after:blur-sm'
          )}
          style={{
            width: '100%',
            transform: `translateX(${pathname ? '0%' : '-100%'})`,
          }}
        />
      </div>
    </NavigationMenu>
  );
}

export default NavBar;
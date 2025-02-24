'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Icons } from '@/components/ui/icons';
import { UserNav } from '@/components/dashboard/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { AuthDebug } from '@/components/auth/auth-debug';
import { buttonVariants } from '@/components/ui/button';

const mainNavItems = [
  {
    title: 'AgriSmart',
    href: '/agrismart/home',
    icon: Icons.sprout,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Icons.dashboard,
  },
  {
    title: 'Fields',
    href: '/dashboard/fields',
    icon: Icons.sprout,
  },
  {
    title: 'Calendar',
    href: '/dashboard/calendar',
    icon: Icons.calendar,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: Icons.chart,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Icons.users,
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: Icons.messageSquare,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-14 items-center">
          {/* Mobile Navigation */}
          <div className="flex items-center space-x-4 lg:hidden">
            <MobileNav items={mainNavItems} />
            <BrandLogo className="h-6" />
          </div>

          {/* Desktop Logo - Hidden on mobile */}
          <div className="hidden items-center space-x-4 lg:flex">
            <BrandLogo className="h-6" />
          </div>

          {/* Right side actions */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar Navigation - Hidden on mobile */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <nav className="relative space-y-1 p-4">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: 'ghost' }),
                    'w-full justify-start',
                    isActive
                      ? 'bg-muted hover:bg-muted'
                      : 'hover:bg-transparent hover:underline'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && <AuthDebug />}
    </div>
  );
}
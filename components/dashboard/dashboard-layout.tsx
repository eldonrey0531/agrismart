'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Icons } from '@/components/ui/icons';
import { UserNav } from '@/components/dashboard/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/dashboard/mobile-nav';

const sidebarItems = [
  {
    title: 'Overview',
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
    title: 'Marketplace',
    href: '/dashboard/marketplace',
    icon: Icons.barChart,
  },
  {
    title: 'Community',
    href: '/dashboard/community',
    icon: Icons.users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Icons.settings,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BrandLogo className="h-6 w-6" asLink={false} />
              <span className="font-semibold">AgriSmart</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile and Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center border-b px-4 lg:px-6">
          <MobileNav />
          <div className="flex flex-1 items-center justify-between">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
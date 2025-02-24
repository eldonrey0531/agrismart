'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';

const settingsNav = [
  {
    title: 'General',
    href: '/dashboard/settings',
    icon: Icons.settings,
    description: 'Manage your account settings and preferences',
  },
  {
    title: 'Profile',
    href: '/dashboard/settings/profile',
    icon: Icons.user,
    description: 'Update your profile information and photo',
  },
  {
    title: 'Notifications',
    href: '/dashboard/settings/notifications',
    icon: Icons.bell,
    description: 'Configure how you receive notifications',
  },
  {
    title: 'Security',
    href: '/dashboard/settings/security',
    icon: Icons.check,
    description: 'Manage your security preferences and devices',
  },
  {
    title: 'Integrations',
    href: '/dashboard/settings/integrations',
    icon: Icons.refresh,
    description: 'Connect and manage third-party services',
  },
] as const;

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container max-w-screen-lg py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <Icons.chevronRight className="h-4 w-4" />
        <span>Settings</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Side Navigation */}
        <Card className="p-4 lg:col-span-1">
          <nav className="flex flex-col space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-4">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * This settings layout provides:
 * 1. Consistent navigation
 * 2. Breadcrumb navigation
 * 3. Section descriptions
 * 4. Active state indicators
 * 5. Responsive design
 * 6. Icon support
 * 7. Proper spacing
 */
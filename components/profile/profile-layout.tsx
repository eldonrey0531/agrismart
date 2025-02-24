'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

const profileNavItems = [
  {
    title: 'General',
    href: '/dashboard/profile',
    icon: Icons.user,
  },
  {
    title: 'Preferences',
    href: '/dashboard/profile/preferences',
    icon: Icons.settings,
  },
  {
    title: 'Security',
    href: '/dashboard/profile/security',
    icon: Icons.check,
  },
  {
    title: 'Notifications',
    href: '/dashboard/profile/notifications',
    icon: Icons.bell,
  },
];

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1">
      {/* Sidebar Navigation */}
      <aside className="hidden w-56 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Profile Settings</h2>
              <nav className="space-y-1">
                {profileNavItems.map((item) => {
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
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
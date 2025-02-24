'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Bell,
  Shield,
  Key,
  CreditCard,
  Settings,
  Phone,
  Share2,
  UserCheck,
} from 'lucide-react';

const settingsNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Manage your profile information'
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Security settings and login history'
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Configure notification preferences'
  },
  {
    title: 'Password',
    href: '/settings/password',
    icon: Key,
    description: 'Update your password'
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    description: 'Manage billing and subscriptions'
  },
  {
    title: 'Preferences',
    href: '/settings/preferences',
    icon: Settings,
    description: 'App preferences and customization'
  },
  {
    title: 'Two-Factor Auth',
    href: '/settings/2fa',
    icon: Phone,
    description: 'Set up two-factor authentication'
  },
  {
    title: 'Connected Accounts',
    href: '/settings/connected',
    icon: Share2,
    description: 'Manage connected accounts'
  },
  {
    title: 'Account Verification',
    href: '/settings/verification',
    icon: UserCheck,
    description: 'Verify your account status'
  }
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {settingsNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
              isActive ? 'bg-accent' : 'transparent',
              isActive ? 'text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium leading-none">
                {item.title}
              </div>
              <div className="line-clamp-1 text-xs text-muted-foreground mt-1">
                {item.description}
              </div>
            </div>
            {isActive && (
              <div className="h-full w-1 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function SettingsMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-none flex gap-4 overflow-x-auto pb-2 pt-1">
      {settingsNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex min-w-[120px] flex-col items-center gap-1 rounded-lg p-3 text-center text-xs transition-all hover:bg-accent',
              isActive ? 'bg-accent' : 'transparent',
              isActive ? 'text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
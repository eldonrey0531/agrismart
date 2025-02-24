'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Key,
  Smartphone,
  HelpCircle,
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Account',
    href: '/settings/account',
    icon: User,
    description: 'Manage your account settings and preferences',
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Configure how you receive notifications',
  },
  {
    title: 'Privacy',
    href: '/settings/privacy',
    icon: Shield,
    description: 'Control your privacy and security settings',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Customize the look and feel of the application',
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Key,
    description: 'Manage your passwords and security settings',
  },
  {
    title: 'Devices',
    href: '/settings/devices',
    icon: Smartphone,
    description: 'Manage connected devices and sessions',
  },
  {
    title: 'Help',
    href: '/settings/help',
    icon: HelpCircle,
    description: 'Get help and find answers to common questions',
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className={cn('mr-3 h-5 w-5 shrink-0')} />
            <div className="flex-1">
              <div
                className={cn(
                  'text-sm font-medium leading-none',
                  isActive ? 'text-primary-foreground' : 'text-foreground'
                )}
              >
                {item.title}
              </div>
              <div
                className={cn(
                  'mt-1 text-xs',
                  isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                )}
              >
                {item.description}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
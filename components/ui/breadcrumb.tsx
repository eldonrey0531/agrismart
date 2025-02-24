'use client';

import Link from 'next/link';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center text-sm text-muted-foreground', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <Icons.chevronRight className="mx-2 h-4 w-4 text-muted-foreground/50" />
            )}
            <Link
              href={item.href}
              className={cn(
                'hover:text-foreground transition-colors',
                index === items.length - 1 
                  ? 'font-medium text-foreground pointer-events-none'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 pb-4">
      <Breadcrumb items={breadcrumbs} className="py-2" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}

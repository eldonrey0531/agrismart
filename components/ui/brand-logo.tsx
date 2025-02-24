'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/icons';

interface BrandLogoProps {
  className?: string;
  asLink?: boolean;
}

export function BrandLogo({ className, asLink = true }: BrandLogoProps) {
  const logo = (
    <div className={cn('flex items-center space-x-2', className)}>
      <Icons.sprout className="h-6 w-6 text-primary" />
      <span className="inline-block font-bold">
        Agri<span className="text-primary">Smart</span>
      </span>
    </div>
  );

  if (!asLink) {
    return logo;
  }

  return (
    <Link href="/agrismart/home" className="hover:opacity-90">
      {logo}
    </Link>
  );
}

export function BrandLogoSmall({ className, asLink = true }: BrandLogoProps) {
  const logo = (
    <div className={cn('flex items-center', className)}>
      <Icons.sprout className="h-4 w-4 text-primary" />
    </div>
  );

  if (!asLink) {
    return logo;
  }

  return (
    <Link href="/agrismart/home" className="hover:opacity-90">
      {logo}
    </Link>
  );
}
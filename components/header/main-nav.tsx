import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    protected: true,
  },
  {
    title: 'Fields',
    href: '/fields',
    protected: true,
  },
  {
    title: 'Community',
    href: '/community',
  },
  {
    title: 'Resources',
    href: '/resources',
  },
  {
    title: 'About',
    href: '/about',
  },
] as const;

/**
 * Main navigation links
 */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith(item.href)
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
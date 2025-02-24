import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import rolesConfig from '@/lib/config/roles';
import { useAuth } from '@/contexts/auth-context';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get navigation items based on user role and account level
  const getNavItems = () => {
    if (!user) return []; // Guest navigation handled separately

    const role = user.role;
    const accountLevel = user.accountLevel;
    const config = rolesConfig[role];

    if (!config) return [];

    // Filter pages based on access and transform to nav items
    return Object.entries(config.pages)
      .filter(([_, pageConfig]) => pageConfig.access !== 'none')
      .map(([path, pageConfig]) => ({
        title: path.split('/').pop()?.replace(/-/g, ' ') || path,
        href: `/${path}`,
        // Show buyer/seller specific features
        hidden: accountLevel && pageConfig.features?.some(f => 
          (accountLevel === 'buyer' && f.includes('sell')) ||
          (accountLevel === 'seller' && f.includes('buy'))
        )
      }))
      .filter(item => !item.hidden)
      .sort((a, b) => a.title.localeCompare(b.title));
  };

  const navItems = getNavItems();

  if (!navItems.length) return null;

  return (
    <nav className={cn('flex flex-col space-y-4', className)}>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start',
            pathname === item.href && 'bg-primary text-primary-foreground'
          )}
          asChild
        >
          <Link href={item.href}>
            <span className="capitalize">{item.title}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}

export default MobileNav;
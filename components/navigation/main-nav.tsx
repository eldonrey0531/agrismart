import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import rolesConfig from '@/lib/config/roles';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const buildNavSections = (): NavSection[] => {
    if (!user) {
      // Guest navigation
      return [{
        items: [
          { title: 'Home', href: '/' },
          { title: 'Marketplace', href: '/marketplace' },
          { title: 'About', href: '/about' },
          { title: 'Contact', href: '/contact' },
          { title: 'Login', href: '/login' },
          { title: 'Sign Up', href: '/signup' }
        ]
      }];
    }

    const role = user.role;
    const accountLevel = user.accountLevel;
    const config = rolesConfig[role];

    if (!config) return [];

    const sections: NavSection[] = [];

    // Main Navigation
    const mainNav: NavItem[] = [
      { title: 'Dashboard', href: '/dashboard' },
      { title: 'Marketplace', href: '/marketplace' }
    ];

    sections.push({ items: mainNav });

    // Account Management
    const accountNav: NavItem[] = [
      { title: 'Profile', href: '/profile' },
      { title: 'Settings', href: '/settings' },
      { title: 'Messages', href: '/messages' }
    ];

    if (accountLevel === 'buyer') {
      accountNav.push({ title: 'My Orders', href: '/dashboard/orders' });
    }

    sections.push({
      title: 'Account',
      items: accountNav
    });

    // Seller Features
    if (accountLevel === 'seller') {
      const sellerNav: NavItem[] = [
        { title: 'My Products', href: '/dashboard/products' },
        { title: 'Inventory', href: '/dashboard/inventory' },
        { title: 'Sales', href: '/dashboard/sales' },
        { title: 'Analytics', href: '/dashboard/analytics' }
      ];

      sections.push({
        title: 'Seller Dashboard',
        items: sellerNav
      });
    }

    // Admin Features
    if (role === 'admin') {
      const adminNav: NavItem[] = [
        { title: 'User Management', href: '/admin/users' },
        { title: 'Moderation', href: '/admin/moderation' },
        { title: 'System Settings', href: '/admin/settings' },
        { title: 'Analytics', href: '/admin/analytics' }
      ];

      sections.push({
        title: 'Administration',
        items: adminNav
      });
    }

    // Moderator Features
    if (role === 'moderator') {
      const modNav: NavItem[] = [
        { title: 'Content Moderation', href: '/admin/moderation' },
        { title: 'User Reports', href: '/admin/reports' }
      ];

      sections.push({
        title: 'Moderation',
        items: modNav
      });
    }

    return sections;
  };

  const navSections = buildNavSections();

  return (
    <nav className="flex flex-col space-y-6">
      {navSections.map((section, index) => (
        <div key={section.title || index} className="flex flex-col space-y-2">
          {section.title && (
            <h4 className="text-sm font-medium text-muted-foreground px-2">
              {section.title}
            </h4>
          )}
          <div className="flex flex-col space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-foreground',
                  'transition-colors'
                )}
              >
                {item.icon && (
                  <span className="mr-2">{item.icon}</span>
                )}
                {item.title}
                {item.badge && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default MainNav;
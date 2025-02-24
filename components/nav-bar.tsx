import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getAccessiblePages, type UserRole } from '@/lib/auth/roles';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

/**
 * Navigation item structure
 */
interface NavItem {
  title: string;
  path: string;
  description?: string;
  role?: UserRole[];
  children?: NavItem[];
}

/**
 * Main navigation items configuration
 */
const navItems: NavItem[] = [
  {
    title: 'Home',
    path: '/',
  },
  {
    title: 'Community',
    path: '/community',
    description: 'Join discussions and share knowledge',
    children: [
      {
        title: 'Discussions',
        path: '/community/discussions',
        description: 'Participate in agricultural discussions',
      },
      {
        title: 'Knowledge Base',
        path: '/community/knowledge',
        description: 'Access shared farming knowledge',
      },
    ],
  },
  {
    title: 'Marketplace',
    path: '/marketplace',
    description: 'Buy and sell agricultural products',
    children: [
      {
        title: 'Browse Products',
        path: '/marketplace/products',
        description: 'View available products',
      },
      {
        title: 'My Orders',
        path: '/marketplace/orders',
        description: 'Manage your orders',
        role: ['buyer', 'admin'],
      },
      {
        title: 'My Listings',
        path: '/marketplace/listings',
        description: 'Manage your product listings',
        role: ['seller', 'admin'],
      },
    ],
  },
  {
    title: 'Resources',
    path: '/resources',
    description: 'Agricultural resources and guides',
  },
];

/**
 * Role-specific navigation items
 */
const roleSpecificItems: Record<UserRole, NavItem[]> = {
  guest: [],
  buyer: [
    {
      title: 'My Purchases',
      path: '/dashboard/purchases',
      description: 'View your purchase history',
    },
  ],
  seller: [
    {
      title: 'My Products',
      path: '/dashboard/products',
      description: 'Manage your product listings',
    },
    {
      title: 'Sales Dashboard',
      path: '/dashboard/sales',
      description: 'View your sales analytics',
    },
  ],
  admin: [
    {
      title: 'Admin',
      path: '/admin',
      description: 'System administration',
      children: [
        {
          title: 'User Management',
          path: '/admin/users',
          description: 'Manage platform users',
        },
        {
          title: 'Content Moderation',
          path: '/admin/moderation',
          description: 'Moderate platform content',
        },
        {
          title: 'System Analytics',
          path: '/admin/analytics',
          description: 'View system analytics',
        },
      ],
    },
  ],
};

/**
 * Check if a nav item is accessible for the current role
 */
function isAccessible(item: NavItem, role: UserRole): boolean {
  if (!item.role) return true;
  return item.role.includes(role) || role === 'admin';
}

/**
 * Get filtered navigation items for the current role
 */
function getNavItems(role: UserRole): NavItem[] {
  const baseItems = navItems.filter(item => isAccessible(item, role));
  const roleItems = roleSpecificItems[role] || [];
  return [...baseItems, ...roleItems];
}

/**
 * Main navigation bar component
 */
export function NavBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user?.role as UserRole) || 'guest';
  const items = getNavItems(userRole);
  const accessiblePages = getAccessiblePages(userRole);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {items.map((item) => (
          <NavigationMenuItem key={item.path}>
            {item.children ? (
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.children
                      .filter(child => isAccessible(child, userRole))
                      .map((child) => (
                        <li key={child.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={child.path}
                              className={cn(
                                'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                !accessiblePages.includes(child.path.split('/')[1]) && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              <div className="text-sm font-medium leading-none">{child.title}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {child.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                href={item.path}
                className={cn(
                  navigationMenuTriggerStyle(),
                  !accessiblePages.includes(item.path.split('/')[1]) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.title}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

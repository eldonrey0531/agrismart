import { UserRole } from '@/types/auth';

/**
 * Navigation item type
 */
export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

/**
 * Main navigation items
 */
export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    description: 'View your personalized dashboard',
    roles: ['buyer', 'seller', 'admin'],
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    description: 'Buy and sell agricultural products',
    roles: ['guest', 'buyer', 'seller', 'admin'],
    children: [
      {
        title: 'Browse Products',
        href: '/marketplace/products',
        roles: ['guest', 'buyer', 'seller', 'admin'],
      },
      {
        title: 'Sell Products',
        href: '/marketplace/sell',
        roles: ['seller', 'admin'],
      },
      {
        title: 'My Orders',
        href: '/marketplace/orders',
        roles: ['buyer', 'admin'],
      },
      {
        title: 'Manage Listings',
        href: '/marketplace/listings',
        roles: ['seller', 'admin'],
      },
    ],
  },
  {
    title: 'Community',
    href: '/community',
    description: 'Connect with other farmers',
    roles: ['guest', 'buyer', 'seller', 'admin'],
    children: [
      {
        title: 'Discussions',
        href: '/community/discussions',
        roles: ['guest', 'buyer', 'seller', 'admin'],
      },
      {
        title: 'Create Post',
        href: '/community/create',
        roles: ['buyer', 'seller', 'admin'],
      },
      {
        title: 'My Posts',
        href: '/community/my-posts',
        roles: ['buyer', 'seller', 'admin'],
      },
    ],
  },
  {
    title: 'Resources',
    href: '/resources',
    description: 'Farming guides and information',
    roles: ['guest', 'buyer', 'seller', 'admin'],
  },
  {
    title: 'Support',
    href: '/support',
    description: 'Get help and support',
    roles: ['buyer', 'seller', 'admin'],
    children: [
      {
        title: 'Chat Support',
        href: '/support/chat',
        roles: ['buyer', 'seller', 'admin'],
      },
      {
        title: 'FAQs',
        href: '/support/faqs',
        roles: ['guest', 'buyer', 'seller', 'admin'],
      },
      {
        title: 'Contact',
        href: '/support/contact',
        roles: ['guest', 'buyer', 'seller', 'admin'],
      },
    ],
  },
];

/**
 * Admin navigation items
 */
export const adminNavItems: NavItem[] = [
  {
    title: 'Admin',
    href: '/admin',
    description: 'Administration dashboard',
    roles: ['admin'],
    children: [
      {
        title: 'Users',
        href: '/admin/users',
        roles: ['admin'],
      },
      {
        title: 'Content',
        href: '/admin/content',
        roles: ['admin'],
      },
      {
        title: 'Moderation',
        href: '/admin/moderation',
        roles: ['admin'],
      },
      {
        title: 'Reports',
        href: '/admin/reports',
        roles: ['admin'],
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        roles: ['admin'],
      },
    ],
  },
];

/**
 * Filter navigation items by role
 */
export function filterNavItems(items: NavItem[], role: UserRole): NavItem[] {
  return items
    .filter(item => !item.roles || item.roles.includes(role))
    .map(item => ({
      ...item,
      children: item.children
        ? filterNavItems(item.children, role)
        : undefined,
    }))
    .filter(item => !item.children || item.children.length > 0);
}

/**
 * Get navigation items for a role
 */
export function getNavigation(role: UserRole = 'guest'): NavItem[] {
  const mainItems = filterNavItems(mainNavItems, role);
  const adminItems = role === 'admin' ? filterNavItems(adminNavItems, role) : [];
  
  return [...mainItems, ...adminItems];
}
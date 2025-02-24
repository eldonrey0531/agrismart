import { type UserRole } from '@/lib/auth/roles';

/**
 * Marketplace action types
 */
export type MarketplaceAction = 
  | 'view_products'
  | 'create_product'
  | 'update_product'
  | 'delete_product'
  | 'place_order'
  | 'cancel_order'
  | 'manage_orders'
  | 'view_analytics';

/**
 * Role-based permission configuration
 */
const marketplacePermissions: Record<UserRole, MarketplaceAction[]> = {
  guest: ['view_products'],
  buyer: [
    'view_products',
    'place_order',
    'cancel_order'
  ],
  seller: [
    'view_products',
    'create_product',
    'update_product',
    'delete_product',
    'manage_orders',
    'view_analytics'
  ],
  admin: [
    'view_products',
    'create_product',
    'update_product',
    'delete_product',
    'place_order',
    'cancel_order',
    'manage_orders',
    'view_analytics'
  ]
};

/**
 * Check if user has permission for a marketplace action
 */
export function hasMarketplacePermission(
  role: UserRole,
  action: MarketplaceAction
): boolean {
  return marketplacePermissions[role]?.includes(action) || role === 'admin';
}

/**
 * Get all permitted actions for a role
 */
export function getPermittedActions(role: UserRole): MarketplaceAction[] {
  return marketplacePermissions[role] || [];
}

/**
 * Check if user can perform seller actions
 */
export function isPermittedSeller(role: UserRole): boolean {
  return role === 'seller' || role === 'admin';
}

/**
 * Check if user can perform buyer actions
 */
export function isPermittedBuyer(role: UserRole): boolean {
  return role === 'buyer' || role === 'admin';
}

/**
 * Validate product ownership
 */
export function canManageProduct(
  role: UserRole,
  productOwnerId: string,
  userId: string
): boolean {
  if (role === 'admin') return true;
  if (role !== 'seller') return false;
  return productOwnerId === userId;
}

/**
 * Validate order management
 */
export function canManageOrder(
  role: UserRole,
  orderId: string,
  userId: string,
  orderData: {
    buyerId: string;
    sellerId: string;
  }
): boolean {
  if (role === 'admin') return true;
  
  switch (role) {
    case 'buyer':
      return orderData.buyerId === userId;
    case 'seller':
      return orderData.sellerId === userId;
    default:
      return false;
  }
}
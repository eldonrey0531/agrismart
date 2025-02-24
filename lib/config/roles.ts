// Role-based configuration for AgriSmart Platform

export type AccessLevel = 'none' | 'view' | 'view-only' | 'full' | 'buy-only' | 'sell-only';

export interface PageAccess {
  access: AccessLevel;
  features?: string[];
}

export interface RoleConfig {
  pages: Record<string, PageAccess>;
  features?: string[];
  api?: string[];
}

// Base configurations
const baseUserPages: Record<string, PageAccess> = {
  home: { access: 'full' },
  about: { access: 'full' },
  contact: { access: 'full' },
  community: { access: 'full' },
  resources: { access: 'full' },
  dashboard: { access: 'full' },
  profile: { access: 'full' },
  settings: { access: 'full' },
  chat: { access: 'full' }
};

const baseSellerPages: Record<string, PageAccess> = {
  'marketplace/create': { access: 'full' },
  'dashboard/products': { access: 'full' },
  'dashboard/inventory': { access: 'full' },
  'dashboard/analytics': { access: 'full' },
  'dashboard/sales': { access: 'full' }
};

const rolesConfig: Record<string, RoleConfig> = {
  guest: {
    pages: {
      home: { access: 'view' },
      about: { access: 'view' },
      contact: { access: 'view' },
      community: { access: 'view-only' },
      resources: { access: 'view' },
      marketplace: { 
        access: 'view-only',
        features: ['browse', 'search', 'filter']
      },
      login: { access: 'view' },
      signup: { access: 'view' }
    },
    features: ['view-products', 'search-products'],
    api: [
      '/api/marketplace/products',
      '/api/auth/login',
      '/api/auth/register'
    ]
  },

  user: {
    pages: {
      ...baseUserPages,
      marketplace: { 
        access: 'buy-only',
        features: ['browse', 'search', 'filter', 'buy', 'chat', 'review']
      }
    },
    features: [
      'view-products',
      'search-products',
      'buy-products',
      'chat-with-sellers',
      'manage-orders',
      'write-reviews'
    ],
    api: [
      '/api/marketplace/products',
      '/api/marketplace/orders',
      '/api/chat',
      '/api/user/profile'
    ]
  },

  seller: {
    pages: {
      ...baseUserPages,
      ...baseSellerPages,
      marketplace: { 
        access: 'sell-only',
        features: ['browse', 'search', 'filter', 'sell', 'manage', 'analytics']
      }
    },
    features: [
      'view-products',
      'search-products',
      'sell-products',
      'manage-inventory',
      'view-analytics',
      'chat-with-buyers',
      'process-orders'
    ],
    api: [
      '/api/marketplace/products',
      '/api/marketplace/orders',
      '/api/chat',
      '/api/user/profile',
      '/api/dashboard/stats',
      '/api/dashboard/inventory'
    ]
  },

  admin: {
    pages: {
      ...baseUserPages,
      ...baseSellerPages,
      marketplace: { access: 'full' },
      'admin/dashboard': { access: 'full' },
      'admin/users': { access: 'full' },
      'admin/moderation': { access: 'full' },
      'admin/settings': { access: 'full' },
      'admin/analytics': { access: 'full' }
    },
    features: [
      'manage-users',
      'manage-roles',
      'moderate-content',
      'system-settings',
      'view-analytics',
      'support-chat',
      'all-marketplace-actions'
    ],
    api: ['*'] // Admin has access to all API endpoints
  },

  moderator: {
    pages: {
      ...baseUserPages,
      ...baseSellerPages,
      marketplace: { access: 'full' },
      'admin/moderation': { access: 'full' },
      'admin/users': { access: 'view' }
    },
    features: [
      'moderate-content',
      'view-users',
      'support-chat',
      'marketplace-moderation'
    ],
    api: [
      '/api/marketplace/products',
      '/api/marketplace/orders',
      '/api/chat',
      '/api/user/profile',
      '/api/admin/moderation'
    ]
  }
};

export const isPageAccessible = (role: string, page: string): boolean => {
  const config = rolesConfig[role];
  if (!config) return false;
  
  const pageAccess = config.pages[page];
  return pageAccess?.access !== 'none' && pageAccess?.access !== undefined;
};

export const getPageFeatures = (role: string, page: string): string[] => {
  const config = rolesConfig[role];
  if (!config) return [];
  
  return config.pages[page]?.features || [];
};

export const hasApiAccess = (role: string, endpoint: string): boolean => {
  const config = rolesConfig[role];
  if (!config) return false;
  
  if (config.api?.includes('*')) return true;
  return config.api?.includes(endpoint) || false;
};

export default rolesConfig;
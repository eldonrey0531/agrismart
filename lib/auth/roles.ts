/**
 * Access level types for pages and features
 */
export type AccessLevel = 'none' | 'view-only' | 'view' | 'full' | 'buy-only' | 'sell-only' | 'admin';

/**
 * Available user roles in the system
 */
export type UserRole = 'guest' | 'buyer' | 'seller' | 'admin';

/**
 * Page configuration type
 */
export interface PageConfig {
  access: AccessLevel;
  requiredRole?: UserRole[];
  features?: string[];
}

/**
 * Role configuration type
 */
export interface RoleConfig {
  pages: {
    [key: string]: PageConfig;
  };
  features?: string[];
}

/**
 * Role configuration for different user types
 */
export const rolesConfig: Record<UserRole, RoleConfig> = {
  guest: {
    pages: {
      home: { access: 'view' },
      about: { access: 'view' },
      community: { access: 'view-only' },
      resources: { access: 'view' },
      marketplace: { access: 'view' },
      contact: { access: 'view' },
      login: { access: 'full' },
      signup: { access: 'full' }
    }
  },
  buyer: {
    pages: {
      home: { access: 'full' },
      about: { access: 'full' },
      community: { access: 'full' },
      resources: { access: 'full' },
      marketplace: { access: 'buy-only' },
      chat: { access: 'full' },
      profile: { access: 'full' },
      settings: { access: 'full' },
      contact: { access: 'full' }
    },
    features: ['place-orders', 'view-products', 'chat-with-sellers']
  },
  seller: {
    pages: {
      home: { access: 'full' },
      about: { access: 'full' },
      community: { access: 'full' },
      resources: { access: 'full' },
      marketplace: { access: 'sell-only' },
      chat: { access: 'full' },
      profile: { access: 'full' },
      settings: { access: 'full' },
      contact: { access: 'full' }
    },
    features: ['manage-products', 'handle-orders', 'chat-with-buyers']
  },
  admin: {
    pages: {
      home: { access: 'admin' },
      about: { access: 'admin' },
      community: { access: 'admin' },
      resources: { access: 'admin' },
      marketplace: { access: 'admin' },
      chat: { access: 'admin' },
      profile: { access: 'admin' },
      settings: { access: 'admin' },
      contact: { access: 'admin' },
      'admin-dashboard': { access: 'admin' }
    },
    features: [
      'manage-users',
      'moderate-content',
      'view-analytics',
      'manage-system',
      'handle-support'
    ]
  }
};

/**
 * Check if a user has access to a specific page
 */
export function hasPageAccess(
  role: UserRole,
  pagePath: string,
  requiredAccess: AccessLevel = 'view'
): boolean {
  // Admin has access to everything
  if (role === 'admin') return true;

  const config = rolesConfig[role];
  if (!config) return false;

  // Normalize page path
  const normalizedPath = pagePath.replace(/^\/+/, '').split('/')[0];

  const pageConfig = config.pages[normalizedPath];
  if (!pageConfig) return false;

  const accessLevels: { [key in AccessLevel]: number } = {
    'none': 0,
    'view-only': 1,
    'view': 2,
    'full': 3,
    'buy-only': 2,
    'sell-only': 2,
    'admin': 4
  };

  return accessLevels[pageConfig.access] >= accessLevels[requiredAccess];
}

/**
 * Check if a user has a specific feature access
 */
export function hasFeatureAccess(role: UserRole, feature: string): boolean {
  if (role === 'admin') return true;

  const config = rolesConfig[role];
  return config?.features?.includes(feature) || false;
}

/**
 * Get all accessible pages for a role
 */
export function getAccessiblePages(role: UserRole): string[] {
  const config = rolesConfig[role];
  if (!config) return [];

  return Object.entries(config.pages)
    .filter(([_, config]) => config.access !== 'none')
    .map(([page]) => page);
}

/**
 * Get all features available for a role
 */
export function getRoleFeatures(role: UserRole): string[] {
  if (role === 'admin') {
    return Object.values(rolesConfig)
      .flatMap(config => config.features || [])
      .filter((v, i, a) => a.indexOf(v) === i); // unique values
  }

  return rolesConfig[role]?.features || [];
}
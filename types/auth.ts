/**
 * User roles
 */
export type UserRole = 
  | 'guest'
  | 'buyer'
  | 'seller'
  | 'admin';

/**
 * Access levels
 */
export type AccessLevel = 
  | 'none'
  | 'view'
  | 'view-only'
  | 'edit'
  | 'full';

/**
 * Page permissions
 */
export interface PagePermission {
  access: AccessLevel;
  features?: string[];
}

/**
 * Role permissions
 */
export interface RolePermissions {
  pages: Record<string, PagePermission>;
  features?: string[];
}

/**
 * Role configuration
 */
export interface RoleConfig {
  role: UserRole;
  title: string;
  description: string;
  permissions: RolePermissions;
}

/**
 * User session
 */
export interface UserSession {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  expires: string;
}

/**
 * User profile
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Role definitions
 */
export const Roles: Record<UserRole, RoleConfig> = {
  guest: {
    role: 'guest',
    title: 'Guest',
    description: 'Unauthenticated user with limited access',
    permissions: {
      pages: {
        community: { access: 'view-only' },
        resources: { access: 'view' },
        marketplace: { access: 'view' }
      }
    }
  },
  buyer: {
    role: 'buyer',
    title: 'Buyer',
    description: 'Authenticated user who can purchase products',
    permissions: {
      pages: {
        community: { access: 'full' },
        resources: { access: 'full' },
        marketplace: { 
          access: 'full',
          features: ['buy', 'review', 'contact-seller']
        }
      }
    }
  },
  seller: {
    role: 'seller',
    title: 'Seller',
    description: 'Authenticated user who can sell products',
    permissions: {
      pages: {
        community: { access: 'full' },
        resources: { access: 'full' },
        marketplace: {
          access: 'full',
          features: ['sell', 'manage-listings', 'contact-buyer']
        }
      }
    }
  },
  admin: {
    role: 'admin',
    title: 'Administrator',
    description: 'Full system access with administration privileges',
    permissions: {
      pages: {
        community: { access: 'full' },
        resources: { access: 'full' },
        marketplace: { access: 'full' },
        admin: { access: 'full' }
      },
      features: ['moderate', 'manage-users', 'system-settings']
    }
  }
};
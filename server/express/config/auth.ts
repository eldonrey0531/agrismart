import { UserRole } from '../types/user';

interface AuthConfig {
  /**
   * Token configuration
   */
  tokens: {
    // Access token settings
    access: {
      secret: string;
      expiresIn: string; // e.g., '15m'
    };
    // Refresh token settings
    refresh: {
      secret: string;
      expiresIn: string; // e.g., '7d'
    };
    // Email verification token settings
    verification: {
      expiresIn: string; // e.g., '24h'
    };
    // Password reset token settings
    passwordReset: {
      expiresIn: string; // e.g., '1h'
    };
  };

  /**
   * Password policy configuration
   */
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventPasswordReuse: boolean;
    expirationDays: number;
  };

  /**
   * Rate limiting configuration
   */
  rateLimiting: {
    // Login attempts
    login: {
      windowMs: number;
      maxAttempts: number;
    };
    // Password reset requests
    passwordReset: {
      windowMs: number;
      maxAttempts: number;
    };
    // Email verification requests
    emailVerification: {
      windowMs: number;
      maxAttempts: number;
    };
  };

  /**
   * Session configuration
   */
  session: {
    name: string;
    secret: string;
    ttl: number; // Time to live in seconds
    secure: boolean;
    sameSite: boolean | 'lax' | 'strict' | 'none';
  };

  /**
   * Role-based access control configuration
   */
  rbac: {
    // Default role for new users
    defaultRole: UserRole;
    // Role hierarchy (inheritance)
    roleHierarchy: {
      [key in UserRole]?: UserRole[];
    };
    // Restricted paths by role
    restrictedPaths: {
      [key: string]: UserRole[];
    };
  };

  /**
   * Auth-related feature flags
   */
  features: {
    emailVerification: boolean;
    passwordExpiration: boolean;
    twoFactorAuth: boolean;
    socialAuth: boolean;
    sessionRevalidation: boolean;
  };
}

export const authConfig: AuthConfig = {
  tokens: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'access-secret',
      expiresIn: '15m',
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      expiresIn: '7d',
    },
    verification: {
      expiresIn: '24h',
    },
    passwordReset: {
      expiresIn: '1h',
    },
  },

  passwordPolicy: {
    minLength: 8,
    maxLength: 100,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventPasswordReuse: true,
    expirationDays: 90,
  },

  rateLimiting: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 3,
    },
    emailVerification: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 5,
    },
  },

  session: {
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'session-secret',
    ttl: 24 * 60 * 60, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },

  rbac: {
    defaultRole: UserRole.USER,
    roleHierarchy: {
      [UserRole.ADMIN]: [UserRole.MODERATOR, UserRole.SELLER],
      [UserRole.MODERATOR]: [UserRole.USER],
      [UserRole.SELLER]: [UserRole.USER],
    },
    restrictedPaths: {
      '/api/admin/*': [UserRole.ADMIN],
      '/api/moderation/*': [UserRole.ADMIN, UserRole.MODERATOR],
      '/api/seller/*': [UserRole.ADMIN, UserRole.SELLER],
    },
  },

  features: {
    emailVerification: true,
    passwordExpiration: true,
    twoFactorAuth: false,
    socialAuth: false,
    sessionRevalidation: true,
  },
};
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
  jwtExpiryTime: process.env.JWT_EXPIRES_IN || '7d',
  refreshTokenExpiryTime: '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  },
  cookieName: 'auth_token',
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  sessionCleanupInterval: 24 * 60 * 60, // 24 hours in seconds
  maxActiveSessions: 5, // Maximum number of active sessions per user
  tokenTypes: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET: 'reset',
    VERIFY: 'verify'
  },
  passwordMinLength: 6,
  passwordResetExpiry: '1h',
  verificationTokenExpiry: '24h',
  roles: {
    GUEST: 'guest',
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator'
  },
  accountLevels: {
    BUYER: 'buyer',
    SELLER: 'seller'
  },
  status: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
  }
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
export default AUTH_CONFIG;
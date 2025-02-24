/**
 * Authentication Constants
 */

export const AUTH_CONSTANTS = {
  // Token expiration times
  EXPIRES_IN: {
    ACCESS_TOKEN: '15m',
    REFRESH_TOKEN: '7d',
    VERIFICATION_TOKEN: '24h',
    RESET_TOKEN: '1h'
  },

  // Token types
  TOKEN_TYPE: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    VERIFICATION: 'verification',
    RESET: 'reset'
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 72, // bcrypt max
    REQUIRE_LOWERCASE: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SYMBOL: true,
    MIN_UNIQUE_CHARS: 4
  },

  // Error messages
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_NOT_VERIFIED: 'Please verify your email first',
    ACCOUNT_INACTIVE: 'Account is not active',
    EMAIL_IN_USE: 'Email is already registered',
    INVALID_TOKEN: 'Invalid or expired token',
    PASSWORD_MISMATCH: 'Current password is incorrect',
    PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and symbol',
    INVALID_EMAIL: 'Invalid email format'
  },

  // Cookie settings
  COOKIE: {
    NAME: {
      ACCESS_TOKEN: 'access_token',
      REFRESH_TOKEN: 'refresh_token'
    },
    OPTIONS: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/'
    }
  },

  // Rate limiting
  RATE_LIMIT: {
    LOGIN: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_ATTEMPTS: 5
    },
    REGISTER: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_ATTEMPTS: 3
    },
    PASSWORD_RESET: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_ATTEMPTS: 3
    }
  },

  // Session
  SESSION: {
    ABSOLUTE_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
    IDLE_TIMEOUT: 30 * 60 * 1000 // 30 minutes
  }
} as const;
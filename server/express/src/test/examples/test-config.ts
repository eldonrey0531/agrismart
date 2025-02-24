import type { TestUser } from './response-types';

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  api: {
    baseUrl: 'http://localhost:3000',
    paths: {
      auth: {
        login: '/auth/login',
        signup: '/auth/signup',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        me: '/auth/me',
      },
      users: {
        profile: '/users/profile',
        password: '/users/password',
        settings: '/users/settings',
      },
    },
    timeout: 10000,
  },

  rateLimiting: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 30 * 60 * 1000, // 30 minutes
  },

  defaultUser: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } as TestUser,

  errors: {
    auth: {
      invalidCredentials: 'Invalid email or password',
      accountLocked: 'Account is locked',
      rateLimitExceeded: 'Too many requests',
      invalidToken: 'Token is invalid',
      expiredToken: 'Token has expired',
      sessionExpired: 'Session has expired',
      unauthorized: 'Unauthorized access',
    },
    validation: {
      invalid: (field: string) => `Invalid ${field} format`,
      required: (field: string) => `${field} is required`,
    },
    network: {
      timeout: 'Network timeout',
      connectionFailed: 'Connection failed',
    },
  },

  mockTokens: {
    valid: 'mock.jwt.token',
    expired: 'mock.expired.token',
    invalid: 'invalid-token',
  },

  security: {
    headers: {
      'Content-Type': 'application/json',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
    },
  },
} as const;

/**
 * Configuration types
 */
export type TestConfig = Omit<typeof TEST_CONFIG, 'defaultUser'> & {
  defaultUser: TestUser;
};

export type ApiPaths = TestConfig['api']['paths'];
export type ErrorMessages = TestConfig['errors'];

/**
 * Helper functions
 */
export const createConfig = (overrides?: Partial<TestConfig>): TestConfig => ({
  ...TEST_CONFIG,
  ...overrides,
});

export const createDefaultUser = (overrides?: Partial<TestUser>): TestUser => ({
  ...TEST_CONFIG.defaultUser,
  ...overrides,
});

export default TEST_CONFIG;

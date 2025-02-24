/**
 * Test configuration
 */
export const TEST_CONFIG = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    paths: {
      auth: {
        login: '/auth/login',
        signup: '/auth/signup',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
      },
      users: {
        base: '/users',
        profile: '/users/profile',
        settings: '/users/settings',
      },
    },
  },
  rateLimits: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      blockDuration: 30 * 60 * 1000, // 30 minutes
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      blockDuration: 15 * 60 * 1000, // 15 minutes
    },
  },
  security: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
    },
    jwt: {
      expiresIn: '1h',
      algorithm: 'HS256',
    },
  },
  mockData: {
    users: {
      valid: {
        email: 'test@example.com',
        password: 'Test123!@#',
        name: 'Test User',
      },
      admin: {
        email: 'admin@example.com',
        password: 'Admin123!@#',
        name: 'Admin User',
        role: 'ADMIN',
      },
    },
    tokens: {
      valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired',
      invalid: 'invalid-token',
    },
  },
  validation: {
    password: {
      minLength: 8,
      maxLength: 100,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true,
      requireLowercase: true,
    },
    email: {
      maxLength: 255,
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    },
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
  },
  errors: {
    validation: {
      email: {
        invalid: 'Invalid email format',
        required: 'Email is required',
        taken: 'Email is already taken',
      },
      password: {
        invalid: 'Invalid password format',
        required: 'Password is required',
        tooWeak: 'Password is too weak',
      },
      auth: {
        invalidCredentials: 'Invalid email or password',
        accountLocked: 'Account is locked',
        unauthorized: 'Unauthorized',
        sessionExpired: 'Session has expired',
      },
    },
    server: {
      internal: 'Internal server error',
      database: 'Database error',
      network: 'Network error',
    },
  },
} as const;

export type TestConfig = typeof TEST_CONFIG;
export default TEST_CONFIG;
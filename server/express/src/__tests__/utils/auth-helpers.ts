import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { Role, Status, AuthUser } from '../../types/auth';

/**
 * Create a test JWT token
 */
export function createTestToken(user: Partial<AuthUser> = {}): string {
  const payload: AuthUser = {
    id: user.id ?? 'test-user-id',
    email: user.email ?? 'test@example.com',
    name: user.name ?? 'Test User',
    role: user.role ?? Role.USER,
    status: user.status ?? Status.ACTIVE,
  };

  return jwt.sign(payload, config.JWT.SECRET);
}

/**
 * Create auth header with test token
 */
export function createAuthHeader(token: string = createTestToken()): string {
  return `Bearer ${token}`;
}

/**
 * Common test users
 */
export const TEST_USERS = {
  admin: {
    id: 'admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN,
    status: Status.ACTIVE,
  },
  seller: {
    id: 'seller-id', 
    email: 'seller@example.com',
    name: 'Seller User',
    role: Role.SELLER,
    status: Status.ACTIVE,
  },
  user: {
    id: 'user-id',
    email: 'user@example.com', 
    name: 'Regular User',
    role: Role.USER,
    status: Status.ACTIVE,
  },
  suspended: {
    id: 'suspended-id',
    email: 'suspended@example.com',
    name: 'Suspended User',
    role: Role.USER,
    status: Status.SUSPENDED,
  },
} as const;
import type { User as PrismaUser } from '@prisma/client'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type AccountLevel = 'BASIC' | 'PREMIUM' | 'SELLER'
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'

export interface BaseUser {
  id: string
  email: string | null
  name: string | null
  emailVerified: Date | null
  image: string | null
  role: UserRole
  accountLevel: AccountLevel
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser extends BaseUser {
  twoFactorEnabled: boolean
  twoFactorSecret?: string | null
  settings?: Record<string, any> | null
}

export type SafeUser = Omit<AuthUser, 'twoFactorSecret' | 'settings'>

// JWT token type
export interface UserToken {
  id: string
  sub: string
  email: string | null
  name: string | null
  role: UserRole
  accountLevel: AccountLevel
  iat: number
  exp: number
  jti: string
}

// Mock user data for testing
export const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Test User',
  emailVerified: null,
  image: null,
  role: 'USER',
  accountLevel: 'BASIC',
  status: 'ACTIVE',
  twoFactorEnabled: false,
  twoFactorSecret: null,
  settings: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Mock token for testing
export const createMockToken = (user: AuthUser): UserToken => ({
  id: user.id,
  sub: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  accountLevel: user.accountLevel,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  jti: 'mock-jti'
})
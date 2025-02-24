import type { UserRole, AccountLevel } from '@/types/next-auth'

// Role hierarchy definition
const roleHierarchy: Record<UserRole, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2
} as const

// Account level hierarchy definition
const levelHierarchy: Record<AccountLevel, number> = {
  BASIC: 0,
  SELLER: 1
} as const

export function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && Object.keys(roleHierarchy).includes(role)
}

export function isValidAccountLevel(level: unknown): level is AccountLevel {
  return typeof level === 'string' && Object.keys(levelHierarchy).includes(level)
}

export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function hasRequiredAccountLevel(userLevel: AccountLevel, requiredLevel: AccountLevel): boolean {
  return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel]
}

// Default values
export const DEFAULT_ROLE = 'USER' as const satisfies UserRole
export const DEFAULT_ACCOUNT_LEVEL = 'BASIC' as const satisfies AccountLevel
export const UNKNOWN_EMAIL = 'unknown@example.com'

// Type guards for auth data
export interface AuthData {
  id?: string
  email?: string | null
  role?: unknown
  accountLevel?: unknown
}

export function getValidRole(data: AuthData): UserRole {
  return isValidRole(data.role) ? data.role : DEFAULT_ROLE
}

export function getValidAccountLevel(data: AuthData): AccountLevel {
  return isValidAccountLevel(data.accountLevel) ? data.accountLevel : DEFAULT_ACCOUNT_LEVEL
}

export function getValidEmail(data: AuthData): string | undefined {
  return data.email || undefined
}

export function getValidId(data: AuthData): string | undefined {
  return data.id || undefined
}
import type { AuthSession } from '@/types/next-auth'
import { UserRole, AccountLevel, UserStatus, AuthToken } from './types'

/**
 * Type guard for checking if value is UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && Object.values(UserRole).includes(value as UserRole)
}

/**
 * Type guard for checking if value is AccountLevel
 */
export function isAccountLevel(value: unknown): value is AccountLevel {
  return typeof value === 'string' && Object.values(AccountLevel).includes(value as AccountLevel)
}

/**
 * Type guard for checking if value is UserStatus
 */
export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === 'string' && Object.values(UserStatus).includes(value as UserStatus)
}

/**
 * Type guard for checking if value is a Session User
 */
export function isSessionUser(user: unknown): user is AuthSession['user'] {
  if (!user || typeof user !== 'object') return false
  
  const typedUser = user as Partial<AuthSession['user']>
  return !!(
    typedUser.id &&
    typedUser.email &&
    isUserRole(typedUser.role) &&
    isAccountLevel(typedUser.accountLevel) &&
    isUserStatus(typedUser.status) &&
    typeof typedUser.twoFactorEnabled === 'boolean'
  )
}

/**
 * Convert session user to AuthToken with type safety
 */
export function sessionToAuthToken(session: AuthSession | null): AuthToken | null {
  if (!session?.user) return null
  if (!isSessionUser(session.user)) return null

  const { user } = session

  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    image: user.image || null,
    role: user.role,
    accountLevel: user.accountLevel,
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorVerified: user.twoFactorVerified || false
  }
}

/**
 * Type guard for AuthToken
 */
export function isAuthToken(value: unknown): value is AuthToken {
  if (!value || typeof value !== 'object') return false
  
  const token = value as Partial<AuthToken>
  
  return !!(
    token.id &&
    token.email &&
    isUserRole(token.role) &&
    isAccountLevel(token.accountLevel) &&
    isUserStatus(token.status) &&
    typeof token.twoFactorEnabled === 'boolean'
  )
}

/**
 * Check if the token needs to be refreshed
 */
export function needsRefresh(token: AuthToken): boolean {
  if (!token.twoFactorEnabled) return false
  if (token.twoFactorVerified) return false
  return true
}
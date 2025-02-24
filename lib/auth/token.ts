import type { JWT } from 'next-auth/jwt'
import type { UserRole, AccountLevel } from '@/types/next-auth'

// Default values
const DEFAULT_ROLE = 'USER' as const satisfies UserRole
const DEFAULT_ACCOUNT_LEVEL = 'BASIC' as const satisfies AccountLevel
const UNKNOWN_ID = 'UNKNOWN'
const UNKNOWN_EMAIL = 'unknown@example.com'

export interface AuthToken extends JWT {
  id: string
  email: string
  role: UserRole
  accountLevel: AccountLevel
  name?: string | null
  picture?: string | null
  sub: string
  iat: number
  exp: number
  jti: string
}

export function isUserRole(role: unknown): role is UserRole {
  return ['USER', 'ADMIN', 'MODERATOR'].includes(String(role))
}

export function isAccountLevel(level: unknown): level is AccountLevel {
  return ['BASIC', 'SELLER'].includes(String(level))
}

export function isAuthToken(token: JWT | null): token is AuthToken {
  if (!token) return false
  
  return (
    typeof token.sub === 'string' &&
    typeof token.email === 'string' &&
    isUserRole(token.role) &&
    isAccountLevel(token.accountLevel)
  )
}

export function createDefaultToken(): AuthToken {
  return {
    id: UNKNOWN_ID,
    email: UNKNOWN_EMAIL,
    role: DEFAULT_ROLE,
    accountLevel: DEFAULT_ACCOUNT_LEVEL,
    name: null,
    picture: null,
    sub: UNKNOWN_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    jti: crypto.randomUUID()
  }
}

export function validateToken(token: JWT | null | undefined): AuthToken {
  if (!token) {
    return createDefaultToken()
  }

  const baseToken = {
    ...createDefaultToken(),
    sub: String(token.sub || UNKNOWN_ID),
    email: String(token.email || UNKNOWN_EMAIL),
    name: token.name || null,
    picture: token.picture || null,
  }

  // Cast token properties safely
  const role = isUserRole(token.role) ? token.role : DEFAULT_ROLE
  const accountLevel = isAccountLevel(token.accountLevel) ? token.accountLevel : DEFAULT_ACCOUNT_LEVEL

  return {
    ...baseToken,
    id: baseToken.sub,
    role,
    accountLevel
  }
}

export function getTokenRole(token: JWT | null): UserRole {
  const validToken = validateToken(token)
  return validToken.role
}

export function getTokenAccountLevel(token: JWT | null): AccountLevel {
  const validToken = validateToken(token)
  return validToken.accountLevel
}

export function hasRequiredRole(token: JWT | null, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2
  }

  const tokenRole = getTokenRole(token)
  return roleHierarchy[tokenRole] >= roleHierarchy[requiredRole]
}

export function hasRequiredAccountLevel(token: JWT | null, requiredLevel: AccountLevel): boolean {
  const levelHierarchy: Record<AccountLevel, number> = {
    BASIC: 0,
    SELLER: 1
  }

  const tokenLevel = getTokenAccountLevel(token)
  return levelHierarchy[tokenLevel] >= levelHierarchy[requiredLevel]
}
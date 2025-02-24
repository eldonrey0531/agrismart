import { headers } from 'next/headers'
import type { UserRole, AccountLevel } from '@/types/next-auth'

// Header keys
const USER_ID_HEADER = 'x-user-id'
const USER_ROLE_HEADER = 'x-user-role'
const USER_ACCOUNT_LEVEL_HEADER = 'x-user-account-level'

// Type for auth header info
export interface AuthHeaderInfo {
  userId: string
  role: UserRole
  accountLevel: AccountLevel
}

/**
 * Get auth information from request headers
 * @returns Auth header information or null if not available
 */
export function getAuthFromHeaders(): AuthHeaderInfo | null {
  const headersList = headers()

  const userId = headersList.get(USER_ID_HEADER)
  const role = headersList.get(USER_ROLE_HEADER) as UserRole | null
  const accountLevel = headersList.get(USER_ACCOUNT_LEVEL_HEADER) as AccountLevel | null

  if (!userId || !role || !accountLevel) {
    return null
  }

  return {
    userId,
    role,
    accountLevel
  }
}

/**
 * Check if the current request has valid auth headers
 */
export function hasValidAuthHeaders(): boolean {
  return getAuthFromHeaders() !== null
}

/**
 * Assert that the current request has valid auth headers
 * @throws Error if auth headers are not present
 */
export function assertAuthHeaders(): AuthHeaderInfo {
  const auth = getAuthFromHeaders()
  if (!auth) {
    throw new Error('Missing or invalid auth headers')
  }
  return auth
}

/**
 * Get the authenticated user ID from headers
 * @throws Error if user ID is not present
 */
export function getUserId(): string {
  const headersList = headers()
  const userId = headersList.get(USER_ID_HEADER)
  if (!userId) {
    throw new Error('User ID not found in request headers')
  }
  return userId
}

/**
 * Get the authenticated user role from headers
 * @throws Error if role is not present
 */
export function getUserRole(): UserRole {
  const headersList = headers()
  const role = headersList.get(USER_ROLE_HEADER) as UserRole
  if (!role) {
    throw new Error('User role not found in request headers')
  }
  return role
}

/**
 * Get the authenticated user account level from headers
 * @throws Error if account level is not present
 */
export function getUserAccountLevel(): AccountLevel {
  const headersList = headers()
  const accountLevel = headersList.get(USER_ACCOUNT_LEVEL_HEADER) as AccountLevel
  if (!accountLevel) {
    throw new Error('User account level not found in request headers')
  }
  return accountLevel
}

// Export header key constants
export const AUTH_HEADERS = {
  USER_ID: USER_ID_HEADER,
  ROLE: USER_ROLE_HEADER,
  ACCOUNT_LEVEL: USER_ACCOUNT_LEVEL_HEADER
} as const
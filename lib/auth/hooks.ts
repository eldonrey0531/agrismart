import { useSession } from "next-auth/react"
import type { UserRole, AccountLevel } from "@/types/next-auth"
import type { Session } from "next-auth"
import {
  hasRequiredRole,
  hasRequiredAccountLevel,
  getValidRole,
  getValidAccountLevel,
  getValidEmail,
  getValidId,
  DEFAULT_ROLE,
  DEFAULT_ACCOUNT_LEVEL,
  type AuthData
} from "./utils"

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  userId?: string
  email?: string
  role: UserRole
  accountLevel: AccountLevel
  hasRole: (requiredRole: UserRole) => boolean
  hasAccountLevel: (requiredLevel: AccountLevel) => boolean
}

/**
 * Hook to access auth state
 */
export function useAuth(): AuthState {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"
  const isAuthenticated = !!session?.user

  // Default values if not authenticated
  if (!isAuthenticated) {
    return {
      isLoading,
      isAuthenticated: false,
      role: DEFAULT_ROLE,
      accountLevel: DEFAULT_ACCOUNT_LEVEL,
      hasRole: () => false,
      hasAccountLevel: () => false,
    }
  }

  // Extract and validate user data
  const userData: AuthData = session?.user || {}
  const role = getValidRole(userData)
  const accountLevel = getValidAccountLevel(userData)

  return {
    isLoading,
    isAuthenticated: true,
    userId: getValidId(userData),
    email: getValidEmail(userData),
    role,
    accountLevel,
    hasRole: (requiredRole) => hasRequiredRole(role, requiredRole),
    hasAccountLevel: (requiredLevel) => hasRequiredAccountLevel(accountLevel, requiredLevel),
  }
}

/**
 * Hook to check if user has required role
 */
export function useRequireRole(role: UserRole): boolean {
  const auth = useAuth()
  return auth.hasRole(role)
}

/**
 * Hook to check if user has required account level
 */
export function useRequireAccountLevel(level: AccountLevel): boolean {
  const auth = useAuth()
  return auth.hasAccountLevel(level)
}

/**
 * Hook to check if user is authenticated
 */
export function useRequireAuth(): AuthState {
  const auth = useAuth()
  if (!auth.isAuthenticated && !auth.isLoading) {
    throw new Error("Authentication required")
  }
  return auth
}

/**
 * Hook to check if user is admin
 */
export function useRequireAdmin(): AuthState {
  const auth = useRequireAuth()
  if (!auth.hasRole("ADMIN")) {
    throw new Error("Admin access required")
  }
  return auth
}

/**
 * Hook to check if user is moderator
 */
export function useRequireModerator(): AuthState {
  const auth = useRequireAuth()
  if (!auth.hasRole("MODERATOR")) {
    throw new Error("Moderator access required")
  }
  return auth
}

/**
 * Hook to check if user is seller
 */
export function useRequireSeller(): AuthState {
  const auth = useRequireAuth()
  if (!auth.hasAccountLevel("SELLER")) {
    throw new Error("Seller account required")
  }
  return auth
}
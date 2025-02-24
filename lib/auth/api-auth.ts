import { headers } from 'next/headers';
import { ApiError } from '@/lib/error';
import type { UserRole } from './roles';

/**
 * Verify role requirements in API routes
 */
export async function verifyRole(requiredRoles: UserRole[]): Promise<{
  userId: string;
  role: UserRole;
}> {
  const headerList = await headers();
  const role = headerList.get('x-user-role');
  const userId = headerList.get('x-user-id');

  if (!role || !userId) {
    throw new ApiError('Unauthorized', 401);
  }

  if (!requiredRoles.includes(role as UserRole)) {
    throw new ApiError('Insufficient permissions', 403);
  }

  return { userId, role: role as UserRole };
}

/**
 * Check if user has specific permission
 */
export function checkPermission(
  currentRole: UserRole,
  requiredRoles: UserRole[],
  action: string
): boolean {
  if (!requiredRoles.includes(currentRole)) {
    return false;
  }

  // Admin has all permissions
  if (currentRole === 'admin') {
    return true;
  }

  // Add specific permission checks here if needed
  return true;
}

/**
 * Get current user from API route
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  role: UserRole;
} | null> {
  try {
    const headerList = await headers();
    const role = headerList.get('x-user-role');
    const userId = headerList.get('x-user-id');

    if (!role || !userId) {
      return null;
    }

    return { userId, role: role as UserRole };
  } catch {
    return null;
  }
}

/**
 * Verify ownership of a resource
 */
export function verifyOwnership(
  resourceOwnerId: string,
  currentUserId: string,
  currentRole: UserRole
): boolean {
  // Admin can access any resource
  if (currentRole === 'admin') {
    return true;
  }

  // Users can only access their own resources
  return resourceOwnerId === currentUserId;
}

/**
 * API route wrapper with role verification
 */
export function withRoleCheck<T>(
  handler: (context: { userId: string; role: UserRole }) => Promise<T>,
  requiredRoles: UserRole[]
) {
  return async (): Promise<T> => {
    const { userId, role } = await verifyRole(requiredRoles);
    return handler({ userId, role });
  };
}

/**
 * API error response type
 */
interface ApiAuthError {
  error: string;
  status: number;
  code: string;
}

/**
 * Error handler for API authentication
 */
export function handleAuthError(error: unknown): ApiAuthError {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      status: error.statusCode,
      code: error.code || 'AUTH_ERROR'
    };
  }

  console.error('API Auth Error:', error);
  return {
    error: 'Internal Server Error',
    status: 500,
    code: 'INTERNAL_ERROR'
  };
}

/**
 * Check if route is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
}
import { useAuth } from '@/hooks/useAuth';

interface RBACConfig {
  superAdmin?: string[];
}

export const useRBAC = (config: RBACConfig = {}) => {
  const { user } = useAuth();
  const superAdminRoles = config.superAdmin || ['super_admin', 'admin'];

  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    if (!user || !user.roles) return false;
    return roles.every(role => user.roles.includes(role));
  };

  const isSuperAdmin = (): boolean => {
    return hasAnyRole(superAdminRoles);
  };

  const hasAccess = (requiredRoles: string[]): boolean => {
    if (isSuperAdmin()) return true;
    return hasAnyRole(requiredRoles);
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isSuperAdmin,
    hasAccess,
    roles: user?.roles || []
  };
};

export default useRBAC;
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';

interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
}

export const RoleGuard = ({ children, roles }: RoleGuardProps) => {
  const { user } = useAuth();
  const { hasAccess } = useRBAC();

  if (!user || !hasAccess(roles)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;

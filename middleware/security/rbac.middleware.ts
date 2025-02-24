import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from './auth.middleware';

interface RBACOptions {
  roles: string[];
  superAdmin?: string[];
}

export const rbacMiddleware = (options: RBACOptions) => {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    try {
      const user = req.user;
      
      if (!user || !user.roles) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const superAdminRoles = options.superAdmin || ['super_admin', 'admin'];
      const isSuperAdmin = user.roles.some(role => superAdminRoles.includes(role));

      if (isSuperAdmin) {
        return next();
      }

      const hasRequiredRole = user.roles.some(role => options.roles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({ 
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error checking permissions'
      });
    }
  };
};

// Usage example:
// export default rbacMiddleware({ roles: ['user', 'editor'] });

export default rbacMiddleware;
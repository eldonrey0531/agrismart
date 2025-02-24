import { RequestHandler } from '../types';

// Public admin base info
export const getAdminBaseInfo: RequestHandler<any> = async (_req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin API - Public Info',
      status: 'operational',
      version: '1.0.0',
      features: {
        userManagement: true,
        systemMonitoring: true,
        contentModeration: true
      },
      availableEndpoints: {
        overview: '/admin/overview',
        stats: '/admin/stats',
        users: '/admin/users',
        system: '/admin/system'
      },
      documentation: '/api/v1/docs/admin'
    }
  });
};
import express from 'express';
import { RequestHandler } from '../types';

const router = express.Router();

// API Info response
const baseApiInfo = {
  success: true as const,
  data: {
    message: 'API is operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
};

// Public endpoints handlers
const getHealth: RequestHandler<any> = async (_req, res) => {
  res.json({
    success: true as const,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
};

const getStatus: RequestHandler<any> = async (_req, res) => {
  res.json({
    success: true as const,
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
};

const getAdminInfo: RequestHandler<any> = async (_req, res) => {
  res.json({
    success: true as const,
    data: {
      message: 'Admin API',
      status: 'operational',
      version: '1.0.0',
      features: {
        userManagement: true,
        systemMonitoring: true,
        contentModeration: true
      },
      endpoints: {
        overview: '/admin/overview',
        stats: '/admin/stats',
        users: '/admin/users',
        system: '/admin/system'
      },
      documentation: '/api/v1/docs/admin'
    }
  });
};

// Mount public routes
router.get('/health', getHealth);
router.get('/status', getStatus);
router.get('/admin', getAdminInfo);

export default router;
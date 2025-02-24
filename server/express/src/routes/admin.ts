import express from 'express';
import { RequestHandler } from '../types';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public endpoint - Base route info
const getAdminInfo: RequestHandler = async (_req, res) => {
  res.json({
    success: true,
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

// Protected route handlers
const getAdminOverview: RequestHandler = async (req, res) => {
  // Check if user has admin role
  const user = req.user;
  if (user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        message: 'Admin access required',
        code: 'FORBIDDEN'
      }
    });
    return;
  }

  res.json({
    success: true,
    data: {
      message: 'Admin overview',
      stats: {
        totalUsers: 0,
        pendingModeration: 0,
        activeReports: 0,
        systemHealth: 'good'
      }
    }
  });
};

const getAdminStats: RequestHandler = async (req, res) => {
  // Check if user has admin role
  const user = req.user;
  if (user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        message: 'Admin access required',
        code: 'FORBIDDEN'
      }
    });
    return;
  }

  res.json({
    success: true,
    data: {
      message: 'Admin stats',
      stats: {
        dailyActiveUsers: 0,
        monthlyActiveUsers: 0,
        totalTransactions: 0
      }
    }
  });
};

// Routes
router.get('/', getAdminInfo);  // Public route

// Protected routes
router.get('/overview', authenticate, getAdminOverview);
router.get('/stats', authenticate, getAdminStats);

export default router;
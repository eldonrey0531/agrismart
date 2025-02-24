import express from 'express';
import { authenticate } from '../middleware/auth';

// Import route modules
import indexRoutes from '../routes/index';
import authRoutes from '../routes/auth';
import adminRoutes from '../routes/admin';
import marketplaceRoutes from '../routes/marketplace';
import chatRoutes from '../routes/chat';
import analyticsRoutes from '../routes/analytics';
import profileRoutes from '../routes/profile';
import notificationRoutes from '../routes/notifications';
import orderRoutes from '../routes/orders';
import productRoutes from '../routes/products';
import moderationRoutes from '../routes/moderation';
import docsRoutes from '../routes/docs';

export const configureRoutes = (app: express.Application) => {
  const API_PREFIX = '/api/v1';

  // Public endpoints
  app.get('/', (_req, res) => res.redirect(API_PREFIX));
  
  app.get(`${API_PREFIX}/health`, (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  });

  app.get(`${API_PREFIX}/status`, (_req, res) => {
    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    });
  });

  // Public routes (no auth required)
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/admin`, adminRoutes); // Base admin route is public
  app.use(`${API_PREFIX}/docs`, docsRoutes);

  // Protected routes (require auth)
  app.use(`${API_PREFIX}/profile`, authenticate, profileRoutes);
  app.use(`${API_PREFIX}/chat`, authenticate, chatRoutes);
  app.use(`${API_PREFIX}/orders`, authenticate, orderRoutes);
  app.use(`${API_PREFIX}/notifications`, authenticate, notificationRoutes);

  // Mixed routes (base public, some endpoints protected)
  app.use(`${API_PREFIX}/marketplace`, marketplaceRoutes);
  app.use(`${API_PREFIX}/products`, productRoutes);
  app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
  app.use(`${API_PREFIX}/moderation`, moderationRoutes);

  // Index route last
  app.use(API_PREFIX, indexRoutes);
};
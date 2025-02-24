import express from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import marketplaceRoutes from './marketplace';
import chatRoutes from './chat';
import analyticsRoutes from './analytics';
import profileRoutes from './profile';
import notificationRoutes from './notifications';
import orderRoutes from './orders';
import productRoutes from './products';
import moderationRoutes from './moderation';
import docsRoutes from './docs';

const router = express.Router();

// API information endpoint
const getApiInfo = async (_req: express.Request, res: express.Response) => {
  const baseUrl = '/api/v1';
  
  res.json({
    success: true,
    data: {
      name: "AgriSmart API",
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      endpoints: {
        // Public endpoints
        auth: `${baseUrl}/auth`,
        docs: `${baseUrl}/docs`,
        health: `${baseUrl}/health`,
        status: `${baseUrl}/status`,

        // Mixed access endpoints
        admin: `${baseUrl}/admin`,
        marketplace: `${baseUrl}/marketplace`,
        analytics: `${baseUrl}/analytics`,
        moderation: `${baseUrl}/moderation`,
        products: `${baseUrl}/products`,

        // Protected endpoints
        profile: `${baseUrl}/profile`,
        chat: `${baseUrl}/chat`,
        notifications: `${baseUrl}/notifications`,
        orders: `${baseUrl}/orders`
      }
    }
  });
};

// Mount the API info route
router.get('/', getApiInfo);

// Export all routes to be mounted in app.ts
export {
  authRoutes,
  adminRoutes,
  marketplaceRoutes,
  chatRoutes,
  analyticsRoutes,
  profileRoutes,
  notificationRoutes,
  orderRoutes,
  productRoutes,
  moderationRoutes,
  docsRoutes
};

// Export the base router
export default router;
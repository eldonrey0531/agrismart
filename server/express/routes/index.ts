import { Router } from 'express';
import authRoutes from './auth';
import marketplaceRoutes from './marketplace';
import productInteractionRoutes from './productInteraction';
import chatRoutes from './chat';

const router = Router();

// Root endpoint with API info
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Agriculture Hub API',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      marketplace: '/api/v1/marketplace',
      interactions: '/api/v1/interactions',
      chat: '/api/v1/chat',
    }
  });
});

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Mount API routes under /api/v1
const apiRouter = Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/marketplace', marketplaceRoutes);
apiRouter.use('/interactions', productInteractionRoutes);
apiRouter.use('/chat', chatRoutes);
router.use('/api/v1', apiRouter);

// Error handling for undefined routes
router.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

export default router;

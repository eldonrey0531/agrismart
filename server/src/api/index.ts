import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import productsRouter from './products';
import cartRouter from './cart';
import marketplaceRouter from './marketplace';
import { errorHandler } from '../middleware/error';
import { rateLimiter } from '../middleware/rate-limit';

const router = Router();

// Apply rate limiting to all routes
router.use(rateLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Version prefix
const v1Router = Router();

// Mount routes
v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/products', productsRouter);
v1Router.use('/cart', cartRouter);
v1Router.use('/marketplace', marketplaceRouter);

// Admin routes (to be implemented)
// v1Router.use('/admin', adminRouter);

// Analytics routes (to be implemented)
// v1Router.use('/analytics', analyticsRouter);

// Mount v1 router
router.use('/v1', v1Router);

// Fallback route for undefined endpoints
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Error handling
router.use(errorHandler);

export default router;
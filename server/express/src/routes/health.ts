import { Router } from 'express';
import { config } from '../config';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      env: config.ENV.NODE_ENV,
      version: process.version,
      uptime: process.uptime()
    },
    status: 200
  });
});

export { router as healthRouter };
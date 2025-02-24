import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import marketplaceRoutes from '../routes/marketplace';

export function initializeServices(app: express.Application) {
  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
      }
    }
  });

  // Apply rate limiter to all routes
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Compression middleware
  app.use(compression());

  // Routes
  app.use('/api/marketplace', marketplaceRoutes);
  // Add other routes here

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler - should be before error handler
  app.use('*', notFoundHandler);

  // Error handling middleware - should be last
  app.use(errorHandler);

  return app;
}

export function validateEnvironment() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_CLOUD_STORAGE_BUCKET'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Optional vars with defaults
  process.env.PORT = process.env.PORT || '3000';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
}

// Helper function to cleanup resources on shutdown
export async function gracefulShutdown(app: express.Application) {
  console.log('Received shutdown signal. Cleaning up...');
  
  // Close the HTTP server
  if (app.get('server')) {
    await new Promise((resolve) => {
      app.get('server').close(resolve);
    });
  }

  // Add other cleanup tasks here (e.g., database connections)
  
  console.log('Cleanup complete. Shutting down.');
  process.exit(0);
}

export default {
  initializeServices,
  validateEnvironment,
  gracefulShutdown
};
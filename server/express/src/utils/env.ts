import type { Application } from 'express-serve-static-core';
import mongoose from 'mongoose';

/**
 * Validate required environment variables and set defaults
 */
export function validateEnvironment() {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Set defaults for optional variables
  setDefaultEnvVars();
}

/**
 * Set default values for optional environment variables
 */
function setDefaultEnvVars() {
  const defaults: Record<string, string> = {
    PORT: '3000',
    NODE_ENV: 'development',
    CORS_ORIGIN: '*',
    LOG_LEVEL: 'info',
    RATE_LIMIT_WINDOW_MS: (15 * 60 * 1000).toString(), // 15 minutes
    RATE_LIMIT_MAX: '100',
    FILE_UPLOAD_MAX_SIZE: (5 * 1024 * 1024).toString(), // 5MB
    FILE_UPLOAD_MAX_FILES: '5'
  };

  Object.entries(defaults).forEach(([key, value]) => {
    process.env[key] = process.env[key] || value;
  });
}

/**
 * Gracefully shutdown the application
 */
export async function gracefulShutdown(app: Application) {
  console.log('Received shutdown signal. Cleaning up...');
  
  try {
    // Close HTTP server
    const server = app.get('server');
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }

    // Close MongoDB connection
    await mongoose.disconnect();
    
    console.log('Cleanup complete. Shutting down.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Setup shutdown handlers for graceful shutdown
 */
export function setupShutdownHandlers(app: Application) {
  const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  shutdownSignals.forEach(signal => {
    process.on(signal, () => gracefulShutdown(app));
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown(app);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown(app);
  });
}

export default {
  validateEnvironment,
  gracefulShutdown,
  setupShutdownHandlers
};
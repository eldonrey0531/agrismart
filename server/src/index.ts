import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { appConfig } from './config/app.config';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/logger';
import { requestId } from './middleware/request-id';
import { redis } from './lib/redis';
import { log } from './utils/logger';
import api from './api';

async function bootstrap() {
  try {
    // Initialize Redis
    await redis.connect();
    log.info('Redis connection established');

    // Create Express app
    const app = express();

    // Basic middleware
    app.use(helmet());
    app.use(cors({
      origin: appConfig.security.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ limit: appConfig.upload.maxSize }));
    app.use(express.urlencoded({ extended: true, limit: appConfig.upload.maxSize }));

    // Request tracking
    app.use(requestId());
    app.use(requestLogger());

    // Health check
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: appConfig.env,
        uptime: process.uptime()
      });
    });

    // API routes
    app.use('/api', api);

    // Error handling
    app.use(errorHandler());

    // Not found handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Cannot ${req.method} ${req.originalUrl}`
        }
      });
    });

    // Create HTTP server
    const server = createServer(app);

    // Start server
    server.listen(appConfig.port, () => {
      log.info(`Server running on port ${appConfig.port} in ${appConfig.env} mode`);
      log.info(`Health check available at http://localhost:${appConfig.port}/health`);
    });

    // Handle shutdown
    const shutdown = async () => {
      log.info('Shutting down server...');
      
      server.close(async () => {
        try {
          await redis.disconnect();
          log.info('Redis connection closed');
          
          process.exit(0);
        } catch (error) {
          log.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force exit after timeout
      setTimeout(() => {
        log.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    log.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

// Start application
bootstrap().catch(error => {
  log.error('Unhandled error during startup:', error);
  process.exit(1);
});
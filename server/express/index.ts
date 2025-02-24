import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import http from "http";
import { configureMiddleware } from "./middleware";
import router from "./routes";
import { connectDB, disconnectDB } from "./db";
import { logger } from "./utils/logger";

// Load environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Create Express app
const app: Application = express();

// Create HTTP server
const server = http.createServer(app);

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));
app.use(compression());

// Configure application middleware
configureMiddleware(app);

// Mount API routes
app.use(router);

// Start server
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 4000;
    const HOST = process.env.HOST || "localhost";

    // Connect to database
    await connectDB();

    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server is running at http://${HOST}:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      if (process.env.NODE_ENV === "development") {
        logger.info(`API Documentation: http://${HOST}:${PORT}/api/v1/docs`);
      }
    });

    // Handle shutdown gracefully
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal");

  // Set a timeout for graceful shutdown
  const shutdownTimeout = setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);

  try {
    // Close database connection
    await disconnectDB();
    logger.info("Database connection closed");

    // Close server
    server.close(() => {
      logger.info("HTTP server closed");
      clearTimeout(shutdownTimeout);
      process.exit(0);
    });

  } catch (error) {
    logger.error("Error during shutdown:", error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  // Attempt graceful shutdown
  gracefulShutdown().catch(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Attempt graceful shutdown
  gracefulShutdown().catch(() => process.exit(1));
});

// Set security headers
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Export app and server for testing
export { app, server };

// Start server if not in test mode
if (process.env.NODE_ENV !== "test") {
  startServer().catch((error) => {
    logger.error("Failed to start application:", error);
    process.exit(1);
  });
}

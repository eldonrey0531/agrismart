import winston from 'winston';
import { appConfig } from '../config/app.config';

// Custom log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length 
    ? `\n${JSON.stringify(metadata, null, 2)}`
    : '';
    
  return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: appConfig.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    appConfig.logging.format === 'json' 
      ? winston.format.json()
      : logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        logFormat
      )
    }),
    // File transports
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Convenience methods
export const log = {
  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
  },

  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },

  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },

  error: (message: string, meta?: Record<string, any>) => {
    logger.error(message, meta);
  },

  http: (message: string, meta?: Record<string, any>) => {
    logger.http(message, meta);
  }
};

// Request context logger
export function createRequestLogger(requestId: string) {
  return {
    debug: (message: string, meta?: Record<string, any>) => {
      logger.debug(message, { requestId, ...meta });
    },

    info: (message: string, meta?: Record<string, any>) => {
      logger.info(message, { requestId, ...meta });
    },

    warn: (message: string, meta?: Record<string, any>) => {
      logger.warn(message, { requestId, ...meta });
    },

    error: (message: string, meta?: Record<string, any>) => {
      logger.error(message, { requestId, ...meta });
    },

    http: (message: string, meta?: Record<string, any>) => {
      logger.http(message, { requestId, ...meta });
    }
  };
}

// Error logger with stack trace
export function logError(error: Error, meta?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    ...meta
  });
}

// Performance logger
export function logPerformance(
  operation: string,
  durationMs: number,
  meta?: Record<string, any>
) {
  logger.info(`Performance: ${operation} took ${durationMs}ms`, {
    performance: {
      operation,
      durationMs,
      ...meta
    }
  });
}

// Security logger
export function logSecurity(
  event: string,
  details: Record<string, any>
) {
  logger.warn(`Security: ${event}`, {
    security: {
      event,
      ...details
    }
  });
}

// Database logger
export function logDatabase(
  operation: string,
  details: Record<string, any>
) {
  logger.debug(`Database: ${operation}`, {
    database: {
      operation,
      ...details
    }
  });
}

// API logger
export function logApi(
  method: string,
  path: string,
  status: number,
  duration: number,
  meta?: Record<string, any>
) {
  logger.http(`API ${method} ${path} ${status} ${duration}ms`, {
    api: {
      method,
      path,
      status,
      duration,
      ...meta
    }
  });
}

// Export logger instance for direct use
export { logger };
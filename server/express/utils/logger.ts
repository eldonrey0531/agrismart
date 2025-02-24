import winston, { Logger, format } from 'winston';
import { config } from '../config';

interface LogMessage {
  level: string;
  message: string;
  timestamp: string;
  stack?: string;
  [key: string]: any;
}

const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }: LogMessage) => {
  const baseLog = `${timestamp} [${level}]: ${message}`;
  const metaInfo = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  const stackTrace = stack ? `\n${stack}` : '';
  return `${baseLog}${metaInfo}${stackTrace}`;
});

// Create Winston logger instance
const winstonLogger: Logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    errors({ stack: true }),
    timestamp(),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        config.logging.colorize ? colorize() : format.uncolorize(),
        timestamp(),
        logFormat
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: `${config.logging.directory}/error.log`,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: `${config.logging.directory}/combined.log`,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream object for Morgan
const stream = {
  write: (message: string): void => {
    logger.logInfo(message.trim());
  },
};

// Define metadata type
interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private logger: winston.Logger;

  constructor(winstonInstance: winston.Logger) {
    this.logger = winstonInstance;
  }

  logError(error: Error, metadata?: LogMetadata): void {
    this.logger.error({
      message: error.message,
      stack: error.stack,
      ...metadata,
    });
  }

  logWarning(message: string, metadata?: LogMetadata): void {
    this.logger.warn({
      message,
      ...metadata,
    });
  }

  logInfo(message: string, metadata?: LogMetadata): void {
    this.logger.info({
      message,
      ...metadata,
    });
  }

  logDebug(message: string, metadata?: LogMetadata): void {
    this.logger.debug({
      message,
      ...metadata,
    });
  }

  // Request logging
  logRequest(metadata: {
    method: string;
    url: string;
    ip: string;
    userAgent?: string;
    userId?: string;
    [key: string]: any;
  }): void {
    this.logger.info('Incoming request', metadata);
  }

  // Response logging
  logResponse(res: { statusCode: number }, metadata?: {
    responseTime: number;
    [key: string]: any;
  }): void {
    const level = res.statusCode >= 400 ? 'error' : 'info';
    this.logger[level]('Response sent', {
      statusCode: res.statusCode,
      ...metadata,
    });
  }
}

const logger = new Logger(winstonLogger);

export default logger;

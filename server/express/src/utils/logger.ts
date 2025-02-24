import winston from 'winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(logColors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}${
      info.splat !== undefined ? `${info.splat}` : ' '
    }${
      info.metadata && Object.keys(info.metadata).length
        ? `\n${JSON.stringify(info.metadata, null, 2)}`
        : ''
    }`
  )
);

export const createLogger = (service: string) => {
  return winston.createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
      }),
    ],
  });
};

// Create default logger instance
export const logger = createLogger('app');

// Export type for type checking
export type Logger = ReturnType<typeof createLogger>;
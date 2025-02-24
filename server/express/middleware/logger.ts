import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Add request ID to the request object
declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Format the log message
 */
function formatLogMessage(req: Request, res: Response, responseTime?: number): string {
  return [
    `[${req.id}]`,
    req.method,
    req.url,
    res.statusCode,
    responseTime ? `${responseTime}ms` : "",
    req.user?.id ? `[${req.user.id}]` : "[-]",
  ].filter(Boolean).join(" ");
}

/**
 * Middleware to generate and attach a request ID
 */
export const requestId = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  req.id = generateRequestId();
  next();
};

/**
 * Middleware to log request timing
 */
export const requestTimer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Mark the start time
  req.startTime = Date.now();

  // Log response timing after the response is sent
  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    const logMessage = formatLogMessage(req, res, duration);

    const metadata = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${duration}ms`,
      userAgent: req.get("user-agent"),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn(logMessage, metadata);
    } else {
      logger.info(logMessage, metadata);
    }
  });

  next();
};

/**
 * Detailed request logger for debugging
 */
export const detailedRequestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === "development") {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) {
      sanitizedBody.password = "[REDACTED]";
    }

    logger.debug("Request details:", {
      requestId: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      body: sanitizedBody,
      headers: {
        "user-agent": req.get("user-agent"),
        "content-type": req.get("content-type"),
        "accept": req.get("accept"),
      },
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
    });
  }
  next();
};

/**
 * Development request logger
 */
export const developmentLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === "development") {
    const logMessage = formatLogMessage(req, res);
    logger.debug(logMessage);
  }
  next();
};

/**
 * Production request logger
 */
export const productionLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.statusCode >= 400) {
    const logMessage = formatLogMessage(req, res);
    logger.info(logMessage);
  }
  next();
};

/**
 * Combine all logging middleware
 */
export const loggingMiddleware = [
  requestId,
  requestTimer,
  process.env.NODE_ENV === "development" ? developmentLogger : productionLogger,
  detailedRequestLogger,
];

export default loggingMiddleware;
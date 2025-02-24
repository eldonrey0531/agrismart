import { Request, Response, NextFunction } from "express";
import { AppError } from "./app-error";
import { logger } from "./logger";

/**
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = 
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Creates a standardized API response
 */
export const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: Error
) => ({
  success,
  message,
  ...(data && { data }),
  ...(error && { error: error.message }),
  timestamp: new Date().toISOString(),
});

/**
 * Validates environment variables
 */
export const validateEnv = (requiredEnvs: string[]): void => {
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  if (missingEnvs.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvs.join(", ")}`);
  }
};

/**
 * Extracts user ID from request object
 */
export const getUserId = (req: Request): string => {
  const userId = req.headers["x-user-id"];
  if (!userId || Array.isArray(userId)) {
    throw new AppError("Unauthorized - Invalid user ID", 401);
  }
  return userId;
};

/**
 * Parses query parameters for pagination
 */
export const getPaginationParams = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Removes sensitive data from user object
 */
export const sanitizeUser = (user: any) => {
  const { password, __v, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
};

/**
 * Logs request details
 */
export const logRequest = (req: Request): void => {
  logger.info({
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? "[REDACTED]" : undefined,
    },
  });
};

/**
 * Validates MongoDB ID
 */
export const isValidMongoId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Parses sorting parameters
 */
export const getSortParams = (req: Request) => {
  const sort = req.query.sort as string;
  if (!sort) return {};

  return sort.split(",").reduce((acc, field) => {
    const order = field.startsWith("-") ? -1 : 1;
    const key = field.replace(/^-/, "");
    return { ...acc, [key]: order };
  }, {});
};

/**
 * Creates query filters from request parameters
 */
export const createQueryFilters = (req: Request) => {
  const filters: Record<string, any> = {};
  const { query } = req;

  Object.keys(query).forEach(key => {
    if (key !== "page" && key !== "limit" && key !== "sort") {
      filters[key] = query[key];
    }
  });

  return filters;
};

/**
 * Measures execution time of async functions
 */
export const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; executionTime: number }> => {
  const start = process.hrtime();
  const result = await fn();
  const [seconds, nanoseconds] = process.hrtime(start);
  const executionTime = seconds * 1000 + nanoseconds / 1000000;

  return { result, executionTime };
};

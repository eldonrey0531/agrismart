import { Request, Response, NextFunction } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string | Buffer;
  statusCode?: number;
  headers?: boolean;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  handler?: (req: Request, res: Response, next: NextFunction) => void;
  onLimitReached?: (req: Request, res: Response, optionsUsed: RateLimitOptions) => void;
}

export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

export interface LogConfig {
  level: string;
  format: string;
  directory: string;
  filename?: string;
  maxSize?: string;
  maxFiles?: string;
  colorize?: boolean;
}

export interface SecurityConfig {
  bcryptSaltRounds: number;
  jwtSecret: string;
  jwtExpiry: string;
  refreshTokenSecret: string;
  refreshTokenExpiry: string;
  cookieSecret?: string;
  corsOrigin: string;
}

export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  maxFiles: number;
  destination: string;
  tempDirectory?: string;
}

export interface CacheConfig {
  ttl: number;
  checkPeriod: number;
  maxItems?: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  port: number;
  path?: string;
  collectDefaultMetrics?: boolean;
}

export interface DocsConfig {
  enabled: boolean;
  swaggerUI: boolean;
  path?: string;
  version?: string;
  title?: string;
  description?: string;
}

export interface FeatureFlags {
  chat: boolean;
  analytics: boolean;
  moderation: boolean;
  notifications: boolean;
}

export type Environment = 'development' | 'production' | 'test';

export interface EnvironmentConfig {
  environment: Environment;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

export interface AppConfig extends EnvironmentConfig {
  port: number;
  apiVersion: string;
  database: DatabaseConfig;
  security: SecurityConfig;
  logging: LogConfig;
  rateLimits: {
    standard: RateLimitOptions;
    auth: RateLimitOptions;
  };
  fileUpload: FileUploadConfig;
  cache: CacheConfig;
  monitoring: MonitoringConfig;
  docs: DocsConfig;
  features: FeatureFlags;
}
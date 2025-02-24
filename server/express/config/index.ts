import env, { isProduction, isDevelopment, isTest } from './env';
import { CorsOptions } from 'cors';
import { CookieOptions } from 'express';
import { AppConfig } from './types';

export const config: AppConfig = {
  environment: env.NODE_ENV,
  isProduction,
  isDevelopment,
  isTest,
  port: parseInt(env.PORT, 10),
  apiVersion: env.API_VERSION,

  database: {
    uri: env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  security: {
    bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
    jwtSecret: env.JWT_SECRET,
    jwtExpiry: env.JWT_EXPIRES_IN,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: env.REFRESH_TOKEN_EXPIRES_IN,
    cookieSecret: env.COOKIE_SECRET,
    corsOrigin: env.CORS_ORIGIN,
  },

  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
    directory: env.LOG_DIR,
    colorize: !isProduction,
    maxSize: '10m',
    maxFiles: '7d',
  },

  rateLimits: {
    standard: {
      windowMs: env.RATE_LIMIT_WINDOW,
      max: env.RATE_LIMIT_MAX,
      message: 'Too many requests, please try again later',
      statusCode: 429,
      headers: true,
    },
    auth: {
      windowMs: env.AUTH_RATE_LIMIT_WINDOW,
      max: env.AUTH_RATE_LIMIT_MAX,
      message: 'Too many authentication attempts, please try again later',
      statusCode: 429,
      headers: true,
    },
  },

  fileUpload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
    maxFiles: env.MAX_FILES_PER_REQUEST,
    destination: 'uploads',
    tempDirectory: 'tmp/uploads',
  },

  cache: {
    ttl: env.CACHE_TTL,
    checkPeriod: env.CACHE_CHECK_PERIOD,
    maxItems: 1000,
  },

  monitoring: {
    enabled: env.ENABLE_METRICS,
    port: env.METRICS_PORT,
    path: '/metrics',
    collectDefaultMetrics: true,
  },

  docs: {
    enabled: env.API_DOCS_ENABLED,
    swaggerUI: env.SWAGGER_UI_ENABLED,
    path: '/docs',
    version: '1.0.0',
    title: 'Agriculture Hub API',
    description: 'API documentation for the Agriculture Hub marketplace',
  },

  features: {
    chat: env.FEATURE_CHAT,
    analytics: env.FEATURE_ANALYTICS,
    moderation: env.FEATURE_MODERATION,
    notifications: env.FEATURE_NOTIFICATIONS,
  },
};

// Common cookie configuration
export const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// CORS configuration
export const corsConfig: CorsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Reset'],
  maxAge: 86400, // 24 hours
};

export default config;

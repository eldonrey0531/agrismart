import { z } from 'zod';

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_VERSION: z.string().default('v1'),

  // Database
  MONGODB_URI: z.string().url(),
  MONGODB_TEST_URI: z.string().url().optional(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_PREFIX: z.string().default('agri-hub:'),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  AUTH_RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),
  AUTH_RATE_LIMIT_MAX: z.string().transform(Number).default('5'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif'),
  MAX_FILES_PER_REQUEST: z.string().transform(Number).default('10'),

  // Security
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
  COOKIE_SECRET: z.string().min(32),
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('debug'),
  LOG_FORMAT: z.enum(['dev', 'combined', 'common', 'short', 'tiny']).default('dev'),
  LOG_DIR: z.string().default('logs'),

  // Content Moderation
  MODERATION_ENABLED: z.string().transform(val => val === 'true').default('true'),
  MODERATION_AUTO_APPROVE: z.string().transform(val => val === 'true').default('false'),
  PROFANITY_FILTER_ENABLED: z.string().transform(val => val === 'true').default('true'),

  // Analytics
  ANALYTICS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  ANALYTICS_RETENTION_DAYS: z.string().transform(Number).default('90'),

  // WebSocket
  WS_HEARTBEAT_INTERVAL: z.string().transform(Number).default('30000'),
  WS_CLIENT_TIMEOUT: z.string().transform(Number).default('120000'),

  // Feature Flags
  FEATURE_CHAT: z.string().transform(val => val === 'true').default('true'),
  FEATURE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  FEATURE_MODERATION: z.string().transform(val => val === 'true').default('true'),
  FEATURE_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),

  // Cache
  CACHE_TTL: z.string().transform(Number).default('3600'),
  CACHE_CHECK_PERIOD: z.string().transform(Number).default('600'),

  // Monitoring
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  METRICS_PORT: z.string().transform(Number).default('9090'),

  // Documentation
  API_DOCS_ENABLED: z.string().transform(val => val === 'true').default('true'),
  SWAGGER_UI_ENABLED: z.string().transform(val => val === 'true').default('true'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Invalid environment variables:\n', errors.join('\n'));
      process.exit(1);
    }
    console.error('❌ Unknown error validating environment variables');
    throw error;
  }
}

// Load and validate environment variables
const env = validateEnv();

// Computed environment flags
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

export default env;

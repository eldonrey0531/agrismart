import { z } from 'zod';
import { config } from '../config';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  DEBUG: z.string().transform((v) => v === 'true').default('false'),

  // JWT
  JWT_SECRET: z.string().min(32).default('your-super-secret-key-min-32-chars-long'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().regex(/^\d+[smhdy]$/).default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().regex(/^\d+[smhdy]$/).default('7d'),
  JWT_ISSUER: z.string().optional(),
  JWT_AUDIENCE: z.string().optional(),

  // Cookie
  COOKIE_SECRET: z.string().min(32).default('your-super-secret-cookie-key-min-32-chars'),

  // Database
  DATABASE_URL: z.string().url().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.string().transform(Number).optional(),
  DATABASE_NAME: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_SSL: z.string().transform((v) => v === 'true').default('false'),

  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
  LOG_DIR: z.string().default('logs'),

  // Upload
  UPLOAD_PATH: z.string().default('./uploads'),
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),

  // Features
  ENABLE_RATE_LIMIT: z.string().transform((v) => v === 'true').default('true'),
  ENABLE_SWAGGER: z.string().transform((v) => v === 'true').default('true'),
  ENABLE_FILE_UPLOAD: z.string().transform((v) => v === 'true').default('true'),
  MAINTENANCE_MODE: z.string().transform((v) => v === 'true').default('false'),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 */
export function validateEnv(): ValidatedEnv {
  try {
    // Parse and validate environment variables
    const env = envSchema.parse(process.env);

    // Additional validations
    if (env.NODE_ENV === 'production') {
      // Ensure critical production configs are set
      if (env.JWT_SECRET === 'your-super-secret-key-min-32-chars-long') {
        throw new Error('Production JWT_SECRET must be set to a secure value');
      }
      if (env.COOKIE_SECRET === 'your-super-secret-cookie-key-min-32-chars') {
        throw new Error('Production COOKIE_SECRET must be set to a secure value');
      }
      if (!env.DATABASE_URL && !env.DATABASE_HOST) {
        throw new Error('Production database configuration is required');
      }
    }

    // S3 storage validation
    if (env.STORAGE_TYPE === 's3') {
      if (!env.AWS_BUCKET_NAME || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
        throw new Error('S3 storage requires AWS credentials');
      }
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        return `${issue.path.join('.')}: ${issue.message}`;
      });
      throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 */
export const env = validateEnv();

export default env;
import { z } from 'zod';
import { ProcessedEnv } from '../types/config';
import { throwError } from '../lib/errors';

// Environment variable schema with transformations
const envSchema = z.object({
  // Required variables
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  DATABASE_URL: z.string().url('Invalid database URL'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),

  // Optional variables with defaults
  JWT_EXPIRY: z.string().default('7d'),
  REDIS_URL: z.string().url('Invalid Redis URL').default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // AWS Configuration
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),

  // SMTP Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  // Application URLs
  CLIENT_URL: z.string().url('Invalid client URL').default('http://localhost:3000'),

  // Monitoring
  SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
});

// Validate environment variables
function validateEnv(): ProcessedEnv {
  try {
    // First, check for required variables
    const requiredVars = [
      'NODE_ENV',
      'DATABASE_URL',
      'JWT_SECRET'
    ] as const;

    const missingVars = requiredVars.filter(key => !process.env[key]);
    if (missingVars.length > 0) {
      throwError.server(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Validate all variables
    const validatedEnv = envSchema.parse(process.env);

    // Additional validation rules
    if (validatedEnv.NODE_ENV === 'production') {
      // Production-specific validations
      if (!validatedEnv.SMTP_USER || !validatedEnv.SMTP_PASS) {
        throwError.server('SMTP credentials are required in production');
      }

      if (!validatedEnv.SENTRY_DSN) {
        console.warn('Warning: Sentry DSN is not configured in production');
      }
    }

    // S3 configuration validation
    const hasPartialS3Config = [
      validatedEnv.AWS_S3_BUCKET,
      validatedEnv.AWS_ACCESS_KEY_ID,
      validatedEnv.AWS_SECRET_ACCESS_KEY,
      validatedEnv.AWS_REGION
    ].some(Boolean);

    const hasCompleteS3Config = [
      validatedEnv.AWS_S3_BUCKET,
      validatedEnv.AWS_ACCESS_KEY_ID,
      validatedEnv.AWS_SECRET_ACCESS_KEY,
      validatedEnv.AWS_REGION
    ].every(Boolean);

    if (hasPartialS3Config && !hasCompleteS3Config) {
      throwError.server('Incomplete S3 configuration. All S3 variables must be provided if any are set');
    }

    return validatedEnv as ProcessedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      throwError.server('Environment validation failed', { details });
    }
    throw error;
  }
}

// Load and validate environment variables
let env: ProcessedEnv;

try {
  env = validateEnv();
} catch (error) {
  console.error('Failed to load environment variables:', error);
  process.exit(1);
}

// Export validated environment variables
export { env };

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Environment-specific configurations
export const getEnvConfig = () => ({
  isDev: isDevelopment(),
  isProd: isProduction(),
  isTest: isTest(),
  requiresAuth: !isTest(), // Disable auth in test environment
  debugLogging: isDevelopment(),
  validateSchemas: !isTest(), // Disable schema validation in test environment
});

// Export singleton validator
export const envValidator = {
  validate: validateEnv,
  isDevelopment,
  isProduction,
  isTest,
  getEnvConfig,
};
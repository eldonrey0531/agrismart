import * as dotenv from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';
import { validateEnv } from './validateEnv';

/**
 * Load environment variables based on NODE_ENV
 */
export function loadEnv(): void {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const rootDir = join(__dirname, '../../');

  // Load environment files in order of priority
  const envFiles = [
    '.env',                    // Base .env file
    `.env.${NODE_ENV}`,       // Environment-specific file
    '.env.local',             // Local overrides
    `.env.${NODE_ENV}.local`, // Environment-specific local overrides
  ];

  // Load each env file if it exists
  envFiles.forEach(file => {
    const envPath = join(rootDir, file);
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
      console.log(`Loaded environment variables from ${file}`);
    }
  });

  try {
    // Validate environment variables
    validateEnv();
    console.log('Environment variables validated successfully');

    // Log current environment
    console.log(`Current environment: ${NODE_ENV}`);
    if (NODE_ENV === 'development') {
      console.log('Debug mode enabled');
    }

    // Check for critical production settings
    if (NODE_ENV === 'production') {
      if (!process.env.DATABASE_URL && !process.env.DATABASE_HOST) {
        console.warn('Warning: Production database configuration is not set');
      }
      if (process.env.JWT_SECRET === 'your-super-secret-key-min-32-chars-long') {
        console.warn('Warning: Using default JWT_SECRET in production');
      }
      if (process.env.DEBUG === 'true') {
        console.warn('Warning: Debug mode is enabled in production');
      }
    }
  } catch (error) {
    console.error('Environment validation failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Check if running in production
 */
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';

/**
 * Check if running in test environment
 */
export const isTest = (): boolean => process.env.NODE_ENV === 'test';

/**
 * Check if debug mode is enabled
 */
export const isDebug = (): boolean => process.env.DEBUG === 'true';

/**
 * Get base URL for the current environment
 */
export const getBaseUrl = (): string => {
  const protocol = isProduction() ? 'https' : 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3001';
  return `${protocol}://${host}${!isProduction() ? `:${port}` : ''}`;
};

export default loadEnv;
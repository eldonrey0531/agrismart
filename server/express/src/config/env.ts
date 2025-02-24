import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
const result = dotenvConfig({
  path: resolve(__dirname, '../../.env')
});

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Verify required environment variables
const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'COOKIE_SECRET',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM'
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Export for type checking
export interface Env {
  PORT: number;
  NODE_ENV: string;
  JWT_SECRET: string;
  COOKIE_SECRET: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
}

// Cast environment variables to their types
export const env: Env = {
  PORT: parseInt(process.env.PORT!, 10),
  NODE_ENV: process.env.NODE_ENV!,
  JWT_SECRET: process.env.JWT_SECRET!,
  COOKIE_SECRET: process.env.COOKIE_SECRET!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: process.env.REDIS_PORT!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: process.env.SMTP_PORT!,
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  EMAIL_FROM: process.env.EMAIL_FROM!
};
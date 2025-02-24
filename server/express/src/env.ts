import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env file from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  
  // MongoDB
  MONGODB_URI: z.string(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // SMTP
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
  SMTP_SECURE: z.string().transform(val => val === 'true').default('false'),
  
  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  
  // Redis (optional)
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    // Log environment variables for debugging (masked sensitive data)
    console.log('Raw Environment variables:', {
      ...process.env,
      JWT_SECRET: process.env.JWT_SECRET?.substring(0, 10) + '...',
      SMTP_PASS: '********'
    });

    const env = envSchema.parse(process.env);
    
    // Log parsed environment
    console.log('Parsed environment:', {
      NODE_ENV: env.NODE_ENV,
      MONGODB_URI: env.MONGODB_URI,
      SMTP_HOST: env.SMTP_HOST,
      SMTP_USER: env.SMTP_USER,
      SMTP_FROM: env.SMTP_FROM,
      FRONTEND_URL: env.FRONTEND_URL,
      // Mask sensitive data
      JWT_SECRET: '********',
      SMTP_PASS: '********'
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.format());
    } else {
      console.error('❌ Error validating environment variables:', error);
    }
    throw new Error('Invalid environment variables');
  }
}

export default validateEnv;
import { AppConfig } from '../types';

const {
  NODE_ENV = 'development',
  PORT = 3001,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRY = '7d',
  REDIS_URL = 'redis://localhost:6379',
  REDIS_PASSWORD,
  AWS_S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  CLIENT_URL = 'http://localhost:3000'
} = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

export const appConfig: AppConfig = {
  env: NODE_ENV as 'development' | 'production' | 'test',
  port: Number(PORT),
  clientUrl: CLIENT_URL,
  
  database: {
    url: DATABASE_URL
  },

  security: {
    jwtSecret: JWT_SECRET,
    jwtExpiry: JWT_EXPIRY,
    bcryptRounds: 12,
    corsOrigins: [CLIENT_URL],
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    sessionMaxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  redis: {
    url: REDIS_URL,
    password: REDIS_PASSWORD
  },

  email: {
    from: SMTP_FROM || 'noreply@agrismart.com',
    smtp: {
      host: SMTP_HOST || 'smtp.gmail.com',
      port: Number(SMTP_PORT) || 587,
      secure: NODE_ENV === 'production',
      auth: {
        user: SMTP_USER || '',
        pass: SMTP_PASS || ''
      }
    }
  },

  storage: {
    s3: AWS_S3_BUCKET ? {
      bucket: AWS_S3_BUCKET,
      region: AWS_REGION,
      accessKey: AWS_ACCESS_KEY_ID,
      secretKey: AWS_SECRET_ACCESS_KEY
    } : undefined,
    local: {
      uploadDir: 'uploads'
    }
  },

  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf'
    ]
  },

  logging: {
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    format: NODE_ENV === 'production' ? 'json' : 'dev'
  },

  features: {
    emailVerification: true,
    twoFactorAuth: false,
    passwordReset: true,
    socialAuth: false,
    maintenance: false
  },

  constants: {
    pagination: {
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100
    },
    cache: {
      ttl: {
        short: 60 * 5, // 5 minutes
        medium: 60 * 60, // 1 hour
        long: 60 * 60 * 24 // 24 hours
      }
    },
    timeouts: {
      verificationToken: 60 * 60 * 24, // 24 hours
      passwordResetToken: 60 * 60, // 1 hour
      otpToken: 60 * 10 // 10 minutes
    }
  },

  monitoring: {
    sentry: {
      enabled: NODE_ENV === 'production',
      dsn: process.env.SENTRY_DSN
    },
    newRelic: {
      enabled: NODE_ENV === 'production',
      licenseKey: process.env.NEW_RELIC_LICENSE_KEY
    }
  }
} as const;

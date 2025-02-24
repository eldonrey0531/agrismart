export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  clientUrl: string;
  
  database: {
    url: string;
    maxConnections?: number;
    ssl?: boolean;
  };

  security: {
    jwtSecret: string;
    jwtExpiry: string;
    bcryptRounds: number;
    corsOrigins: string[];
    rateLimitWindow: number;
    rateLimitMax: number;
    sessionMaxAge: number;
  };

  redis: {
    url: string;
    password?: string;
    db?: number;
    maxRetries?: number;
  };

  email: {
    from: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };

  storage: {
    s3?: {
      bucket: string;
      region: string;
      accessKey: string;
      secretKey: string;
    };
    local: {
      uploadDir: string;
    };
  };

  upload: {
    maxSize: number;
    allowedTypes: string[];
  };

  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'dev';
  };

  features: {
    emailVerification: boolean;
    twoFactorAuth: boolean;
    passwordReset: boolean;
    socialAuth: boolean;
    maintenance: boolean;
  };

  marketplace: {
    maxFeaturedProducts: number;
    maxTrendingProducts: number;
    maxRecentProducts: number;
    defaultPageSize: number;
    maxPageSize: number;
    minSearchChars: number;
    reviewsPerPage: number;
    maxBatchSize: number;
  };

  constants: {
    pagination: {
      defaultPage: number;
      defaultLimit: number;
      maxLimit: number;
    };
    cache: {
      ttl: {
        short: number;
        medium: number;
        long: number;
      };
    };
    timeouts: {
      verificationToken: number;
      passwordResetToken: number;
      otpToken: number;
    };
  };

  monitoring: {
    sentry: {
      enabled: boolean;
      dsn?: string;
    };
    newRelic: {
      enabled: boolean;
      licenseKey?: string;
    };
  };
}

// Raw environment variables (before validation/transformation)
export interface EnvVars {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRY?: string;
  REDIS_URL?: string;
  REDIS_PASSWORD?: string;
  AWS_S3_BUCKET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  CLIENT_URL?: string;
  SENTRY_DSN?: string;
  NEW_RELIC_LICENSE_KEY?: string;
}

// Processed environment variables (after validation/transformation)
export interface ProcessedEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  REDIS_URL: string;
  REDIS_PASSWORD?: string;
  AWS_S3_BUCKET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  CLIENT_URL: string;
  SENTRY_DSN?: string;
  NEW_RELIC_LICENSE_KEY?: string;
}

// Feature flag type
export type FeatureFlag = keyof AppConfig['features'];

// Environment type
export type Environment = AppConfig['env'];

// Logging level type
export type LogLevel = AppConfig['logging']['level'];

// Cache TTL keys
export type CacheTTL = keyof AppConfig['constants']['cache']['ttl'];

// Config validation schema type
export type ConfigSchema<T> = {
  validate: (data: unknown) => T;
};
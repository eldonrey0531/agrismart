import { z } from 'zod';

// Configuration schema for type safety
const ConfigSchema = z.object({
  // API URLs
  nextPublicApiUrl: z.string().url().optional(),
  expressApiUrl: z.string().url().default('http://localhost:5000'), // Updated to port 5000
  
  // Server Configuration
  port: z.number().default(5000), // Express server port
  host: z.string().default('localhost'),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  debug: z.boolean().default(false),
  
  // Authentication
  jwtSecret: z.string().min(32),
  jwtExpiryTime: z.string().default('15m'),
  jwtRefreshExpiryTime: z.string().default('7d'),
  jwtIssuer: z.string().default('agriculture-hub'),
  jwtAudience: z.string().default('agriculture-hub-client'),
  refreshTokenSecret: z.string().min(32),
  
  // Database
  mongoUri: z.string().url().default('mongodb://localhost:27017/agriculture-hub'),
  mongoTestUri: z.string().url().default('mongodb://localhost:27017/agriculture-hub-test'),
  
  // Redis Configuration
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(6379),
    password: z.string().optional(),
    username: z.string().optional(),
    prefix: z.string().default('agri-hub:'),
  }).default({
    host: 'localhost',
    port: 6379,
    prefix: 'agri-hub:',
  }),
  
  // Email Configuration
  smtp: z.object({
    host: z.string(),
    port: z.number().default(587),
    user: z.string(),
    pass: z.string(),
    secure: z.boolean().default(false),
    from: z.string().email(),
  }).optional(),
  
  // Security Configuration
  security: z.object({
    cookieSecret: z.string(),
    corsOrigin: z.string().default('http://localhost:3000'),
    bcryptSaltRounds: z.number().default(10),
  }).default({
    cookieSecret: 'default-cookie-secret-to-be-overridden',
    corsOrigin: 'http://localhost:3000',
    bcryptSaltRounds: 10,
  }),
  
  // Rate Limiting
  rateLimit: z.object({
    windowMs: z.number().default(900000),
    max: z.number().default(100),
    authWindowMs: z.number().default(900000),
    authMax: z.number().default(5),
  }).default({
    windowMs: 900000,
    max: 100,
    authWindowMs: 900000,
    authMax: 5,
  }),
  
  // File Upload Configuration
  upload: z.object({
    path: z.string().default('./uploads'),
    maxFileSize: z.number().default(5242880),
    allowedFileTypes: z.array(z.string()).default([
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]),
    maxFilesPerRequest: z.number().default(5),
  }).default({
    path: './uploads',
    maxFileSize: 5242880,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFilesPerRequest: 5,
  }),
  
  // Logging Configuration
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('debug'),
    format: z.enum(['dev', 'combined', 'json']).default('dev'),
    dir: z.string().default('logs'),
  }).default({
    level: 'debug',
    format: 'dev',
    dir: 'logs',
  }),
  
  // Feature Flags
  features: z.object({
    chat: z.boolean().default(true),
    analytics: z.boolean().default(true),
    moderation: z.boolean().default(true),
    notifications: z.boolean().default(true),
  }).default({
    chat: true,
    analytics: true,
    moderation: true,
    notifications: true,
  }),
  
  // Content Moderation
  moderation: z.object({
    enabled: z.boolean().default(true),
    autoApprove: z.boolean().default(false),
    profanityFilterEnabled: z.boolean().default(true),
  }).default({
    enabled: true,
    autoApprove: false,
    profanityFilterEnabled: true,
  }),
  
  // Analytics Configuration
  analytics: z.object({
    enabled: z.boolean().default(true),
    retentionDays: z.number().default(90),
  }).default({
    enabled: true,
    retentionDays: 90,
  }),
  
  // WebSocket Configuration
  websocket: z.object({
    heartbeatInterval: z.number().default(30000),
    clientTimeout: z.number().default(120000),
  }).default({
    heartbeatInterval: 30000,
    clientTimeout: 120000,
  }),
  
  // Cache Configuration
  cache: z.object({
    ttl: z.number().default(3600),
    checkPeriod: z.number().default(600),
    enableResponseCache: z.boolean().default(true),
  }).default({
    ttl: 3600,
    checkPeriod: 600,
    enableResponseCache: true,
  }),
  
  // API Documentation
  docs: z.object({
    enabled: z.boolean().default(true),
    swaggerUiEnabled: z.boolean().default(true),
  }).default({
    enabled: true,
    swaggerUiEnabled: true,
  }),
  
  // Performance Monitoring
  performance: z.object({
    enableRequestLogging: z.boolean().default(true),
    enableMonitoring: z.boolean().default(true),
    slowRequestThresholdMs: z.number().default(1000),
    enableMetrics: z.boolean().default(true),
    metricsPort: z.number().default(9090),
  }).default({
    enableRequestLogging: true,
    enableMonitoring: true,
    slowRequestThresholdMs: 1000,
    enableMetrics: true,
    metricsPort: 9090,
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigService {
  private static instance: ConfigService;
  private config: Config;

  private constructor() {
    // Load and validate configuration from environment variables
    const rawConfig = {
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      expressApiUrl: process.env.EXPRESS_API_URL || 'http://localhost:5000',
      port: parseInt(process.env.PORT || '5000', 10),
      host: process.env.HOST || 'localhost',
      nodeEnv: process.env.NODE_ENV || 'development',
      debug: process.env.DEBUG === 'true',
      jwtSecret: process.env.JWT_SECRET || this.generateSecret(),
      jwtExpiryTime: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
      jwtRefreshExpiryTime: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
      jwtIssuer: process.env.JWT_ISSUER || 'agriculture-hub',
      jwtAudience: process.env.JWT_AUDIENCE || 'agriculture-hub-client',
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || this.generateSecret(),
      mongoUri: process.env.MONGODB_URI,
      mongoTestUri: process.env.MONGODB_TEST_URI,
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        prefix: process.env.REDIS_PREFIX || 'agri-hub:',
      },
      smtp: process.env.SMTP_HOST ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        secure: process.env.SMTP_SECURE === 'true',
        from: process.env.EMAIL_FROM || '',
      } : undefined,
      security: {
        cookieSecret: process.env.COOKIE_SECRET || this.generateSecret(),
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
      },
    };

    try {
      this.config = ConfigSchema.parse(rawConfig);
    } catch (error) {
      console.error('Configuration validation error:', error);
      throw error;
    }
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Get entire configuration
  public getConfig(): Config {
    return this.config;
  }

  // Get specific configuration value
  public get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  // Generate a random secret
  private generateSecret(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 32;
    let secret = '';
    
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    console.warn('WARNING: Using generated secret. This should be properly set in production.');
    return secret;
  }

  // Check if we're in development mode
  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  // Check if we're in production mode
  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  // Check if we're in test mode
  public isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
}

// Export singleton instance
export const configService = ConfigService.getInstance();
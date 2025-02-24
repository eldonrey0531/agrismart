declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      HOST?: string;
      DEBUG?: string;

      // CORS
      CORS_ORIGIN?: string;

      // JWT
      JWT_SECRET: string;
      JWT_ACCESS_TOKEN_EXPIRES_IN?: string;
      JWT_REFRESH_TOKEN_EXPIRES_IN?: string;
      JWT_ISSUER?: string;
      JWT_AUDIENCE?: string;

      // Cookie
      COOKIE_SECRET?: string;

      // Database
      DATABASE_URL: string;
      DATABASE_HOST?: string;
      DATABASE_PORT?: string;
      DATABASE_NAME?: string;
      DATABASE_USER?: string;
      DATABASE_PASSWORD?: string;
      DATABASE_SSL?: string;

      // Redis
      REDIS_URL?: string;
      REDIS_HOST?: string;
      REDIS_PORT?: string;
      REDIS_PASSWORD?: string;

      // Email
      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASS?: string;
      SMTP_FROM?: string;

      // Storage
      UPLOAD_PATH?: string;
      STORAGE_TYPE?: 'local' | 's3';
      AWS_BUCKET_NAME?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;
      AWS_REGION?: string;

      // Logging
      LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
      LOG_DIR?: string;

      // OAuth
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      GITHUB_CLIENT_ID?: string;
      GITHUB_CLIENT_SECRET?: string;

      // API Keys
      OPENAI_API_KEY?: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;

      // Features
      ENABLE_RATE_LIMIT?: string;
      ENABLE_SWAGGER?: string;
      ENABLE_FILE_UPLOAD?: string;
      MAINTENANCE_MODE?: string;
    }
  }
}

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      CLIENT_URL: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_SECURE: string;
      EMAIL_USER: string;
      EMAIL_PASSWORD: string;
      EMAIL_FROM: string;
      REDIS_URL: string;
    }
  }
}

export {};
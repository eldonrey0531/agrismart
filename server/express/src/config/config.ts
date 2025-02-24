interface Config {
  port: number;
  nodeEnv: string;
  jwt: {
    secret: string;
    accessExpiration: string;
    refreshExpiration: string;
  };
  db: {
    uri: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  frontend: {
    url: string;
  };
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

export const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  db: {
    uri: process.env.MONGODB_URI,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

export default config;
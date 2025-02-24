import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Database
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriculture-hub';
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Rate Limiting
export const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10); // 15 minutes
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

// WebSocket Configuration
export const WS_HEARTBEAT_INTERVAL = parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10);
export const WS_CLIENT_TIMEOUT = parseInt(process.env.WS_CLIENT_TIMEOUT || '120000', 10);

// File Upload
export const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB
export const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES?.split(',') || [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];
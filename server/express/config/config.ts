import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the backend .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agrismart',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    accessExpiration: '15m',         // 15 minutes
    refreshExpiration: '7d',         // 7 days
    verificationExpiration: '24h',   // 24 hours
    resetExpiration: '1h',          // 1 hour
  },

  bcrypt: {
    saltRounds: 12,
  },

  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  },

  email: {
    // Gmail configuration
    gmail: {
      user: process.env.GMAIL_USER,
      appPassword: process.env.GMAIL_APP_PASSWORD,
    },
    // Sender information
    from: {
      email: process.env.GMAIL_USER || 'noreply@agrismart.com',
      name: process.env.EMAIL_FROM_NAME || 'AgriSmart',
    },
    // Rate limiting for emails
    rateLimits: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxSends: 5, // 5 emails per hour
    },
    // Email template subjects
    templates: {
      verification: {
        subject: 'Verify Your Email - AgriSmart',
        buttonText: 'Verify Email',
      },
      passwordReset: {
        subject: 'Reset Your Password - AgriSmart',
        buttonText: 'Reset Password',
      },
      passwordChanged: {
        subject: 'Your Password Has Been Changed - AgriSmart',
      },
    },
    branding: {
      logo: {
        url: 'https://agrismart.com/logo.png',
        width: '150px',
      },
      colors: {
        primary: '#4CAF50',
        secondary: '#2E7D32',
        accent: '#DC2626',
        background: '#FFFFFF',
        text: '#1F2937',
      },
    },
    footer: {
      companyName: 'AgriSmart Inc.',
      address: '123 Farming Street, Agritown, AGR 12345',
      supportEmail: process.env.GMAIL_USER || 'support@agrismart.com',
      socialMedia: {
        facebook: 'https://facebook.com/agrismart',
        twitter: 'https://twitter.com/agrismart',
        instagram: 'https://instagram.com/agrismart',
      },
    },
  },

  // Rate limiting configurations for different routes
  rateLimiting: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5, // 5 attempts per window
    },
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per window
    },
    email: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxSends: 5, // 5 emails per hour
    },
  },
} as const;

export type Config = typeof config;
export default config;
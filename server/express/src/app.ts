import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Import controllers
import { getBaseInfo } from './controllers/auth';

// Import middleware
import { errorHandler, notFoundHandler } from './utils/express-utils';
import { authenticate } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import marketplaceRoutes from './routes/marketplace';
import chatRoutes from './routes/chat';
import analyticsRoutes from './routes/analytics';
import profileRoutes from './routes/profile';
import notificationRoutes from './routes/notifications';
import orderRoutes from './routes/orders';
import productRoutes from './routes/products';
import moderationRoutes from './routes/moderation';
import docsRoutes from './routes/docs';

const app = express();
const API_PREFIX = '/api/v1';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security
app.use(helmet());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Root redirect
app.get('/', (_req, res) => res.redirect(API_PREFIX));

// Mount routes in order of precedence:

// 1. System endpoints (no auth required)
app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  });
});

app.get(`${API_PREFIX}/status`, (_req, res) => {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// 2. Auth routes (login/register)
app.use(`${API_PREFIX}/auth`, authRoutes);

// 3. Public documentation
app.use(`${API_PREFIX}/docs`, docsRoutes);

// 4. Mixed access routes (handle their own auth)
app.use(`${API_PREFIX}/marketplace`, marketplaceRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/moderation`, moderationRoutes);

// 5. Protected routes (always require auth)
app.use(`${API_PREFIX}/profile`, authenticate, profileRoutes);
app.use(`${API_PREFIX}/chat`, authenticate, chatRoutes);
app.use(`${API_PREFIX}/orders`, authenticate, orderRoutes);
app.use(`${API_PREFIX}/notifications`, authenticate, notificationRoutes);

// API base info
app.get(API_PREFIX, getBaseInfo);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Registered routes:');
  app._router.stack
    .filter((r: any) => r.route)
    .forEach((r: any) => {
      console.log(`${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
    });
}

export default app;

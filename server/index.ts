import express from 'express';
import type { RequestHandler } from 'express';
import type { Request, Response } from 'express-serve-static-core';
import { createServer } from 'http';
import cors from 'cors';
import { initializeSocket } from './socket';
import { prisma } from './lib/prisma';

const app = express();
const httpServer = createServer(app);

// Initialize socket server
const socketServer = initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL,
  credentials: true
}));
app.use(express.json());

// Basic routes
const healthCheck: RequestHandler = (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

app.get('/health', healthCheck);

// Error handling
const errorHandler: RequestHandler = (err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal server error'
  });
};

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log('📱 Socket.IO server initialized');
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  await Promise.all([
    new Promise<void>((resolve) => httpServer.close(() => resolve())),
    prisma.$disconnect()
  ]);
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
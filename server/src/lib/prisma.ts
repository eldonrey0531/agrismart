import { PrismaClient } from '@prisma/client';
import { appConfig } from '../config/app.config';

// Prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: appConfig.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: appConfig.database.url
    }
  },
  // Connection pool settings
  __internal: {
    engine: {
      connectionLimit: appConfig.database.maxConnections
    }
  }
});

if (appConfig.env === 'development') {
  global.prisma = prisma;
}

// Helper functions for common database operations
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

// Connection management
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Database disconnection error:', error);
    process.exit(1);
  }
}

// Handle cleanup on app termination
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
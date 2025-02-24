import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';
import matchers from './matchers';
import type { TestResponse } from '../types/test';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.COOKIE_SECRET = 'test-cookie-secret';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/chat_app_test';

// Initialize Prisma client for tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
});

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests unless DEBUG is enabled
const mockConsole = {
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn, // Keep these for debugging
  error: console.error,
};

if (!process.env.DEBUG) {
  global.console = { ...console, ...mockConsole };
}

/**
 * Database cleanup
 */
async function clearDatabase() {
  const tableNames = ['messages', 'conversation_participants', 'conversations', 'users'];
  
  for (const tableName of tableNames) {
    try {
      await prisma.$executeRaw`TRUNCATE TABLE ${tableName} CASCADE`;
    } catch (error) {
      console.error(`Failed to clear table ${tableName}:`, error);
    }
  }
}

// Global test hooks
beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await clearDatabase();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Add custom matchers to Jest
expect.extend(matchers);

// Make sure unhandled rejections fail tests
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

// Export test utilities
export { prisma };
export type { TestResponse };
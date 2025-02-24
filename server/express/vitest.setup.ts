/// <reference types="vitest/globals" />

import mongoose from 'mongoose';

const setupTestEnv = () => {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('JWT_SECRET', 'test-secret');
  vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/test-db');
  vi.stubEnv('RATE_LIMIT_WINDOW', '60000');
  vi.stubEnv('RATE_LIMIT_MAX', '100');

  vi.setConfig({
    testTimeout: 10000,
    hookTimeout: 10000,
  });
};

const setupTestDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/test-db');
    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw error;
  }
};

const clearTestDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    await Promise.all(
      Object.values(collections).map(collection => collection.deleteMany({}))
    );
  }
};

const teardownTestDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Test database disconnect failed:', error);
    throw error;
  }
};

// Global setup
beforeAll(async () => {
  setupTestEnv();
  await setupTestDatabase();
});

// Global teardown
afterAll(async () => {
  await teardownTestDatabase();
});

// Before each test
beforeEach(() => {
  vi.resetAllMocks();
});

// After each test
afterEach(async () => {
  await clearTestDatabase();
  vi.clearAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  setupTestEnv(); // Restore test environment variables
});

// Error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
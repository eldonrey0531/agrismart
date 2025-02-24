import { vi } from 'vitest';
import mongoose from 'mongoose';

export const setupMiddlewareTests = () => {
  // Setup mocks
  vi.mock('../../utils/logger', () => ({
    default: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    },
  }));

  // Setup test environment variables
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('JWT_SECRET', 'test-secret');
  vi.stubEnv('RATE_LIMIT_WINDOW', '60000');
  vi.stubEnv('RATE_LIMIT_MAX', '100');
};

export const teardownMiddlewareTests = async () => {
  // Clear all mocks
  vi.clearAllMocks();
  vi.unstubAllEnvs();

  // Clear timers if any were used
  vi.useRealTimers();

  // Clear MongoDB collections if connected
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

export const setupTestDatabase = async () => {
  // Connect to test database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect('mongodb://localhost:27017/test-db');
  }
};

export const teardownTestDatabase = async () => {
  // Disconnect from test database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

interface MockTimestamps {
  minute: number;
  hour: number;
  day: number;
  week: number;
  month: number;
}

export const getMockTimestamps = (): MockTimestamps => {
  const now = Date.now();
  return {
    minute: now - 60 * 1000,
    hour: now - 60 * 60 * 1000,
    day: now - 24 * 60 * 60 * 1000,
    week: now - 7 * 24 * 60 * 60 * 1000,
    month: now - 30 * 24 * 60 * 60 * 1000,
  };
};

export const runWithMockTime = async (fn: () => Promise<void>) => {
  vi.useFakeTimers();
  try {
    await fn();
  } finally {
    vi.useRealTimers();
  }
};

export const runWithMockEnv = async (
  env: Record<string, string>,
  fn: () => Promise<void>
) => {
  // Store original env values
  const originalEnv: Record<string, string | undefined> = {};
  Object.keys(env).forEach((key) => {
    originalEnv[key] = process.env[key];
  });

  // Set mock env values
  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });

  try {
    await fn();
  } finally {
    // Restore original env values
    vi.unstubAllEnvs();
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value !== undefined) {
        vi.stubEnv(key, value);
      }
    });
  }
};

export default {
  setupMiddlewareTests,
  teardownMiddlewareTests,
  setupTestDatabase,
  teardownTestDatabase,
  getMockTimestamps,
  runWithMockTime,
  runWithMockEnv,
};
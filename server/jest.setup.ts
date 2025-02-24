import 'jest';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { redis } from './src/lib/redis';
import { log } from './src/utils/logger';

// Load environment variables
config({ path: '.env.test' });

// Mock Redis
jest.mock('./src/lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }
}));

// Mock Logger
jest.mock('./src/utils/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Create and export test database client
export const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Reset mocks and database before each test
beforeEach(async () => {
  jest.clearAllMocks();
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany()
  ]);
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Global test utilities
global.createTestUser = async (data = {}) => {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword123',
      role: 'USER',
      ...data
    }
  });
};

global.createTestProduct = async (data = {}) => {
  const seller = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      name: 'Test Seller',
      password: 'hashedPassword123',
      role: 'SELLER'
    }
  });

  return prisma.product.create({
    data: {
      title: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      stock: 10,
      category: 'Test Category',
      sellerId: seller.id,
      ...data
    }
  });
};

// Custom matchers
expect.extend({
  toBeValidUuid(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid UUID`,
      pass
    };
  }
});

// Type augmentation for global utilities
declare global {
  // eslint-disable-next-line no-var
  var createTestUser: (data?: Record<string, any>) => Promise<any>;
  // eslint-disable-next-line no-var
  var createTestProduct: (data?: Record<string, any>) => Promise<any>;

  namespace jest {
    interface Matchers<R> {
      toBeValidUuid(): R;
    }
  }
}

// Mock AWS S3
jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => ({
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({ Location: 'https://test-bucket.s3.amazonaws.com/test.jpg' })
  }))
}));

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  JWT_SECRET: 'test-jwt-secret',
  DATABASE_URL: 'postgresql://postgres:password@localhost:5432/agrismart_test',
  REDIS_URL: 'redis://localhost:6379/1'
};
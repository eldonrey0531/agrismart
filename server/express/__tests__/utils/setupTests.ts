import mongoose from 'mongoose';
import TestDb from './testDb';
import type { TestUser, TestProduct, TestOrder } from './types';
import TestFactory from './factories';
import { createMockResponse, MockResponse } from './mockResponse';
import { createMockRequest } from './mockRequest';

interface SetupTestOptions {
  withDb?: boolean;
  withUser?: boolean;
  withProduct?: boolean;
  withOrder?: boolean;
}

interface SetupTestResult {
  req: ReturnType<typeof createMockRequest>;
  res: MockResponse;
  next: jest.Mock;
  user?: TestUser;
  product?: TestProduct;
  order?: TestOrder;
  cleanup: () => Promise<void>;
}

/**
 * Sets up a test environment with necessary mocks and data
 */
export async function setupTest(options: SetupTestOptions = {}): Promise<SetupTestResult> {
  const {
    withDb = false,
    withUser = false,
    withProduct = false,
    withOrder = false,
  } = options;

  // Initialize test objects
  let user: TestUser | undefined;
  let product: TestProduct | undefined;
  let order: TestOrder | undefined;

  // Connect to test database if needed
  if (withDb) {
    await TestDb.connect();
  }

  // Create test data if requested
  if (withUser) {
    user = await TestFactory.createUser();
  }

  if (withProduct) {
    product = await TestFactory.createProduct({
      seller: user?._id || (await TestFactory.createUser({ role: 'seller' }))._id,
    });
  }

  if (withOrder) {
    order = await TestFactory.createOrder({
      buyer: user?._id || (await TestFactory.createUser())._id,
      product: product?._id || (await TestFactory.createProduct())._id,
    });
  }

  // Create mock request and response
  const req = createMockRequest({ user });
  const res = createMockResponse();
  const next = vi.fn();

  // Return cleanup function
  const cleanup = async () => {
    if (withDb) {
      await TestDb.clearDatabase();
    }
  };

  return {
    req,
    res,
    next,
    user,
    product,
    order,
    cleanup,
  };
}

/**
 * Sets up a test suite with database connection
 */
export function setupTestSuite(): void {
  beforeAll(async () => {
    await TestDb.connect();
  });

  afterAll(async () => {
    await TestDb.closeDatabase();
  });

  afterEach(async () => {
    await TestDb.clearDatabase();
    vi.clearAllMocks();
  });
}

/**
 * Creates an authenticated test environment
 */
export async function setupAuthTest(role: 'user' | 'seller' | 'admin' = 'user'): Promise<SetupTestResult> {
  const user = await TestFactory.createUser({ role });
  const req = createMockRequest({ user });
  const res = createMockResponse();
  const next = vi.fn();

  return {
    req,
    res,
    next,
    user,
    cleanup: async () => {
      await TestDb.clearDatabase();
    },
  };
}

/**
 * Helper to check if MongoDB is connected
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Helper to generate test data
 */
export function generateTestData(): {
  id: string;
  timestamp: number;
  randomString: string;
} {
  return {
    id: new mongoose.Types.ObjectId().toString(),
    timestamp: Date.now(),
    randomString: Math.random().toString(36).substring(7),
  };
}

/**
 * Helper to wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  setupTest,
  setupTestSuite,
  setupAuthTest,
  isMongoConnected,
  generateTestData,
  wait,
};
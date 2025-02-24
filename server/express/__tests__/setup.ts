import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Redis } from 'ioredis';
import { Mock } from 'vitest';

// Define Redis mock interface
interface RedisMock {
  set: Mock;
  get: Mock;
  del: Mock;
  expire: Mock;
  quit: Mock;
  [key: string]: Mock;
}

const redisMock: RedisMock = {
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
  quit: vi.fn(),
};

vi.mock('ioredis', () => ({
  Redis: vi.fn().mockImplementation(() => redisMock),
}));

// Mock WebSocket
vi.mock('ws', () => ({
  WebSocket: vi.fn(),
  WebSocketServer: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    clients: new Set(),
    close: vi.fn(),
  })),
}));

let mongoServer: MongoMemoryServer;

// MongoDB connection options
const mongoOptions = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Setup before all tests
beforeAll(async () => {
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, mongoOptions);

  // Clear all mocks
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }

  // Reset all mocks
  vi.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  // Close MongoDB connection
  await mongoose.disconnect();
  await mongoServer.stop();

  // Clear all mocks
  vi.resetAllMocks();
});

// Test data interfaces
interface TestUser {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  [key: string]: any;
}

interface TestProduct {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  sellerId?: string;
  [key: string]: any;
}

interface TestOrder {
  buyerId?: string;
  productId?: string;
  quantity?: number;
  status?: string;
  [key: string]: any;
}

interface MockRequest {
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
  user?: any;
  [key: string]: any;
}

// Test utilities
export const testUtils = {
  // Create test user
  createTestUser: async (data: TestUser = {}) => {
    const User = mongoose.model('User');
    return await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@',
      role: 'user',
      status: 'active',
      ...data,
    });
  },

  // Create test product
  createTestProduct: async (data: TestProduct = {}) => {
    const Product = mongoose.model('Product');
    return await Product.create({
      title: 'Test Product',
      description: 'Test description',
      price: 99.99,
      category: 'electronics',
      sellerId: data.sellerId || (await testUtils.createTestUser())._id,
      ...data,
    });
  },

  // Create test order
  createTestOrder: async (data: TestOrder = {}) => {
    const Order = mongoose.model('Order');
    const buyer = await testUtils.createTestUser();
    const product = await testUtils.createTestProduct();
    
    return await Order.create({
      buyerId: buyer._id,
      productId: product._id,
      quantity: 1,
      status: 'pending',
      ...data,
    });
  },

  // Mock request object
  mockRequest: (data: MockRequest = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    user: null,
    ...data,
  }),

  // Mock response object
  mockResponse: () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
  },

  // Clear database
  clearDatabase: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  },

  // Reset mocks
  resetMocks: () => {
    vi.clearAllMocks();
    (Object.keys(redisMock) as (keyof RedisMock)[]).forEach(key => {
      redisMock[key].mockClear();
    });
  },
};

export default testUtils;
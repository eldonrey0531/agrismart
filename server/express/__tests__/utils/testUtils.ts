import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../../models/User';
import { UserDocument, UserRole, UserStatus } from '../../types/user';
import { signJwtAccessToken } from '../../../lib/jwt';
import { TestUtils, TestRequest } from '../../types/jest';

let mongod: MongoMemoryServer;

/**
 * Connect to the in-memory database.
 */
export const connect = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create a test user with default values
 */
export const createTestUser = async (userData: Partial<UserDocument> = {}): Promise<UserDocument> => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    mobile: '+1234567890',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    isVerified: true,
    accountLevel: 'basic',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
  };

  return await User.create({ ...defaultUser, ...userData });
};

/**
 * Generate a test JWT token
 */
export const generateTestToken = (userId: string, role: string = UserRole.USER): string => {
  return signJwtAccessToken({
    userId,
    role,
    email: 'test@example.com',
    isVerified: true,
  });
};

/**
 * Create authenticated test request
 */
export const createAuthenticatedRequest = async (
  overrides: Partial<TestRequest> = {}
): Promise<TestRequest> => {
  const user = await createTestUser(overrides.user);
  const accessToken = generateTestToken(user.id, user.role);

  return {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...overrides.headers,
    },
    user,
    accessToken,
    ...overrides,
  };
};

/**
 * Create an admin user and request
 */
export const createAdminRequest = async (
  overrides: Partial<TestRequest> = {}
): Promise<TestRequest> => {
  return createAuthenticatedRequest({
    user: {
      role: UserRole.ADMIN,
      ...overrides.user,
    },
    ...overrides,
  });
};

/**
 * Setup test database before tests
 */
export const setupTestDatabase = async (): Promise<void> => {
  try {
    await connect();
  } catch (error) {
    console.error('Error connecting to the test database:', error);
    throw error;
  }
};

/**
 * Teardown test database after tests
 */
export const teardownTestDatabase = async (): Promise<void> => {
  try {
    await closeDatabase();
  } catch (error) {
    console.error('Error closing the test database:', error);
    throw error;
  }
};

export const testUtils: TestUtils = {
  createTestUser,
  generateTestToken,
  clearDatabase,
  setupTestDatabase,
  teardownTestDatabase,
};
import mongoose from 'mongoose';
import {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  clearDatabase,
  getMongooseConnection,
} from '../../config/database';
import { config } from '../../config';
import logger from '../../utils/logger';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    logInfo: vi.fn(),
    logError: vi.fn(),
    logWarning: vi.fn(),
  },
}));

describe('Database Configuration', () => {
  const originalUri = config.database.uri;

  beforeAll(() => {
    // Ensure we're using test database
    config.database.uri = 'mongodb://localhost:27017/test-db';
  });

  afterAll(async () => {
    // Restore original URI
    config.database.uri = originalUri;
    await mongoose.disconnect();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('connectDatabase', () => {
    test('successfully connects to MongoDB', async () => {
      const connection = await connectDatabase();
      
      expect(connection).toBeDefined();
      expect(isDatabaseConnected()).toBe(true);
      expect(logger.logInfo).toHaveBeenCalledWith(
        'MongoDB connected successfully'
      );
    });

    test('handles connection errors', async () => {
      // Invalid URI to trigger error
      config.database.uri = 'invalid-uri';

      await expect(connectDatabase()).rejects.toThrow();
      expect(logger.logError).toHaveBeenCalled();

      // Restore valid URI
      config.database.uri = 'mongodb://localhost:27017/test-db';
    });
  });

  describe('disconnectDatabase', () => {
    test('successfully disconnects from MongoDB', async () => {
      await connectDatabase();
      await disconnectDatabase();

      expect(isDatabaseConnected()).toBe(false);
      expect(logger.logInfo).toHaveBeenCalledWith(
        'MongoDB connection closed'
      );
    });
  });

  describe('isDatabaseConnected', () => {
    test('returns true when connected', async () => {
      await connectDatabase();
      expect(isDatabaseConnected()).toBe(true);
    });

    test('returns false when disconnected', async () => {
      await disconnectDatabase();
      expect(isDatabaseConnected()).toBe(false);
    });
  });

  describe('clearDatabase', () => {
    beforeEach(async () => {
      await connectDatabase();
      // Create a test collection and insert a document
      const TestModel = mongoose.model(
        'Test',
        new mongoose.Schema({ name: String })
      );
      await TestModel.create({ name: 'test' });
    });

    test('clears all collections in test environment', async () => {
      config.isTest = true;
      await clearDatabase();

      const collections = getMongooseConnection().collections;
      for (const collection of Object.values(collections)) {
        const count = await collection.countDocuments();
        expect(count).toBe(0);
      }
    });

    test('throws error when not in test environment', async () => {
      config.isTest = false;
      await expect(clearDatabase()).rejects.toThrow(
        'clearDatabase can only be called in test environment'
      );
    });
  });

  describe('connection event handlers', () => {
    test('logs warning on disconnection', async () => {
      await connectDatabase();
      mongoose.connection.emit('disconnected');

      expect(logger.logWarning).toHaveBeenCalledWith(
        'MongoDB disconnected'
      );
    });

    test('logs error on connection error', async () => {
      await connectDatabase();
      const testError = new Error('Test connection error');
      mongoose.connection.emit('error', testError);

      expect(logger.logError).toHaveBeenCalledWith(testError);
    });
  });
});
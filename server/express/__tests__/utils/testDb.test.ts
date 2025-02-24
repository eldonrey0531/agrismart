import mongoose from 'mongoose';
import TestDb from './testDb';
import logger from '../../utils/logger';

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    logInfo: vi.fn(),
    logError: vi.fn(),
  },
}));

describe('TestDb Utility', () => {
  afterEach(async () => {
    vi.clearAllMocks();
    if (TestDb.isConnected()) {
      await TestDb.closeDatabase();
    }
  });

  describe('connection management', () => {
    test('connects to test database successfully', async () => {
      await TestDb.connect();
      
      expect(TestDb.isConnected()).toBe(true);
      expect(logger.logInfo).toHaveBeenCalledWith(
        'Connected to in-memory test database'
      );
    });

    test('closes database connection successfully', async () => {
      await TestDb.connect();
      await TestDb.closeDatabase();
      
      expect(TestDb.isConnected()).toBe(false);
      expect(logger.logInfo).toHaveBeenCalledWith(
        'Test database connection closed'
      );
    });

    test('provides access to MongoDB memory server instance', async () => {
      await TestDb.connect();
      const mongod = TestDb.getMongod();
      
      expect(mongod).toBeDefined();
      expect(mongod?.getUri()).toBeDefined();
    });
  });

  describe('database operations', () => {
    beforeEach(async () => {
      await TestDb.connect();
    });

    test('clears all collections', async () => {
      // Create a test collection and insert data
      const TestSchema = new mongoose.Schema({ name: String });
      const TestModel = await TestDb.createCollection('Test', TestSchema, [
        { name: 'test1' },
        { name: 'test2' },
      ]);

      // Verify data was inserted
      let count = await TestModel.countDocuments();
      expect(count).toBe(2);

      // Clear database
      await TestDb.clearDatabase();

      // Verify data was cleared
      count = await TestModel.countDocuments();
      expect(count).toBe(0);
      expect(logger.logInfo).toHaveBeenCalledWith('Test database cleared');
    });

    test('creates collection with data', async () => {
      const TestSchema = new mongoose.Schema({ name: String });
      const testData = [{ name: 'test1' }, { name: 'test2' }];

      const TestModel = await TestDb.createCollection('TestCreate', TestSchema, testData);
      
      const documents = await TestModel.find().lean();
      expect(documents).toHaveLength(2);
      expect(documents[0].name).toBe('test1');
      expect(documents[1].name).toBe('test2');
    });

    test('drops specific collection', async () => {
      // Create two test collections
      const TestSchema = new mongoose.Schema({ name: String });
      await TestDb.createCollection('TestDrop1', TestSchema, [{ name: 'test1' }]);
      await TestDb.createCollection('TestDrop2', TestSchema, [{ name: 'test2' }]);

      // Drop one collection
      await TestDb.dropCollection('TestDrop1');

      // Verify only one collection was dropped
      const collections = Object.keys(TestDb.getConnection().collections);
      expect(collections).not.toContain('TestDrop1');
      expect(collections).toContain('TestDrop2');
    });
  });

  describe('error handling', () => {
    test('handles connection errors gracefully', async () => {
      // Mock mongoose.connect to throw error
      const mockError = new Error('Connection failed');
      vi.spyOn(mongoose, 'connect').mockRejectedValueOnce(mockError);

      await expect(TestDb.connect()).rejects.toThrow('Connection failed');
      expect(logger.logError).toHaveBeenCalledWith(mockError);
    });

    test('handles collection creation errors', async () => {
      await TestDb.connect();

      // Try to create collection with invalid schema
      const invalidSchema = null as unknown as mongoose.Schema;
      await expect(
        TestDb.createCollection('InvalidTest', invalidSchema)
      ).rejects.toThrow();
      expect(logger.logError).toHaveBeenCalled();
    });

    test('handles database clearing errors', async () => {
      await TestDb.connect();

      // Mock deleteMany to throw error
      const mockError = new Error('Clear failed');
      const collection = TestDb.getConnection().collection('test');
      vi.spyOn(collection, 'deleteMany').mockRejectedValueOnce(mockError);

      await expect(TestDb.clearDatabase()).rejects.toThrow();
      expect(logger.logError).toHaveBeenCalled();
    });
  });
});
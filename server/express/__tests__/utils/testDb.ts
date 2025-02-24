import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import logger from '../../utils/logger';

class TestDb {
  private static mongod: MongoMemoryServer | null = null;

  /**
   * Connect to the in-memory database.
   */
  static async connect(): Promise<void> {
    try {
      if (!this.mongod) {
        this.mongod = await MongoMemoryServer.create();
      }

      const uri = this.mongod.getUri();
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions);

      logger.logInfo('Connected to in-memory test database');
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error('Failed to connect to test database'));
      throw error;
    }
  }

  /**
   * Drop database, close the connection and stop mongod.
   */
  static async closeDatabase(): Promise<void> {
    try {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      if (this.mongod) {
        await this.mongod.stop();
        this.mongod = null;
      }
      logger.logInfo('Test database connection closed');
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error('Failed to close test database'));
      throw error;
    }
  }

  /**
   * Remove all data from collections.
   */
  static async clearDatabase(): Promise<void> {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      logger.logInfo('Test database cleared');
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error('Failed to clear test database'));
      throw error;
    }
  }

  /**
   * Return the current MongoDB memory server instance.
   */
  static getMongod(): MongoMemoryServer | null {
    return this.mongod;
  }

  /**
   * Check if connected to test database.
   */
  static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get the current database connection.
   */
  static getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  /**
   * Create a test collection with specified data.
   */
  static async createCollection(
    name: string,
    schema: mongoose.Schema,
    data: any[] = []
  ): Promise<mongoose.Model<any>> {
    try {
      const model = mongoose.model(name, schema);
      if (data.length > 0) {
        await model.insertMany(data);
      }
      return model;
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error(`Failed to create collection ${name}`));
      throw error;
    }
  }

  /**
   * Drop a specific collection.
   */
  static async dropCollection(name: string): Promise<void> {
    try {
      await mongoose.connection.collections[name]?.drop();
    } catch (error) {
      logger.logError(error instanceof Error ? error : new Error(`Failed to drop collection ${name}`));
      throw error;
    }
  }
}

export default TestDb;
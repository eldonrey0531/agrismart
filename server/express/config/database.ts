import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const uri = config.database.uri;
    const options = config.database.options;

    mongoose.connection.on('connected', () => {
      logger.logInfo('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.logError(err instanceof Error ? err : new Error('MongoDB error'));
    });

    mongoose.connection.on('disconnected', () => {
      logger.logWarning('MongoDB disconnected');
    });

    // Handle Node.js process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.logInfo('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.logError(err instanceof Error ? err : new Error('Error closing MongoDB connection'));
        process.exit(1);
      }
    });

    // Connect to MongoDB
    await mongoose.connect(uri, options);

    return mongoose;
  } catch (error) {
    logger.logError(error instanceof Error ? error : new Error('Error connecting to MongoDB'));
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.logInfo('MongoDB connection closed');
  } catch (error) {
    logger.logError(error instanceof Error ? error : new Error('Error disconnecting from MongoDB'));
    throw error;
  }
}

export function getMongooseConnection(): mongoose.Connection {
  return mongoose.connection;
}

// Helper function to check if we're connected to MongoDB
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Helper function to clear all collections (useful for testing)
export async function clearDatabase(): Promise<void> {
  if (config.isTest) {
    const collections = mongoose.connection.collections;
    await Promise.all(
      Object.values(collections).map(collection => collection.deleteMany({}))
    );
  } else {
    throw new Error('clearDatabase can only be called in test environment');
  }
}

// Schema plugin to handle common fields
export function commonSchemaPlugin(schema: mongoose.Schema): void {
  // Add timestamps
  schema.set('timestamps', true);

  // Add version key
  schema.set('versionKey', '__v');

  // Add toJSON transform
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    },
  });

  // Add toObject transform
  schema.set('toObject', {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    },
  });
}

export default {
  connectDatabase,
  disconnectDatabase,
  getMongooseConnection,
  isDatabaseConnected,
  clearDatabase,
  commonSchemaPlugin,
};
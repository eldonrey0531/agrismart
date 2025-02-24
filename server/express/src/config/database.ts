import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { validateEnv } from '../env';

const env = validateEnv();

/**
 * Connect to MongoDB
 */
export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(env.MONGODB_URI);
    
    logger.info('Successfully connected to MongoDB', {
      database: mongoose.connection.name,
      host: mongoose.connection.host,
    });

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Successfully disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}
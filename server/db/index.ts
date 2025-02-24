import mongoose from "mongoose";
import { logger } from "../express/utils/logger";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/agrismart";

interface ConnectionOptions extends mongoose.ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

const options: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        logger.info("Mongoose connection closed through app termination");
        process.exit(0);
      } catch (err) {
        logger.error("Error closing Mongoose connection:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error("Error closing MongoDB connection:", error);
    throw error;
  }
};

export const getConnection = (): mongoose.Connection => {
  return mongoose.connection;
};

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Health check function
export const checkDBConnection = async (): Promise<boolean> => {
  try {
    if (!isConnected()) {
      return false;
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      logger.error("Database instance not found");
      return false;
    }

    // Perform a simple query to verify connection
    await db.admin().ping();
    return true;
  } catch (error) {
    logger.error("Database health check failed:", error);
    return false;
  }
};

// Clear database (for testing purposes)
export const clearDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("clearDatabase can only be called in test environment");
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database instance not found");
    }

    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    logger.info("Database cleared");
  } catch (error) {
    logger.error("Error clearing database:", error);
    throw error;
  }
};

export default {
  connectDB,
  disconnectDB,
  getConnection,
  isConnected,
  checkDBConnection,
  clearDatabase,
};
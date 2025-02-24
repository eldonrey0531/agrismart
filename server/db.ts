import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

interface GlobalMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongo | undefined;
}

const globalMongo = global as unknown as { mongoose: GlobalMongo };

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
if (!globalMongo.mongoose) {
  globalMongo.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  console.log('Connecting to MongoDB...');
  
  if (globalMongo.mongoose.conn) {
    console.log('Using cached MongoDB connection');
    return globalMongo.mongoose.conn;
  }

  if (!globalMongo.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      globalMongo.mongoose.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  try {
    globalMongo.mongoose.conn = await globalMongo.mongoose.promise;
  } catch (error) {
    globalMongo.mongoose.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }

  return globalMongo.mongoose.conn;
}

// Listen for connection errors
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  globalMongo.mongoose.conn = null;
  globalMongo.mongoose.promise = null;
});

// Listen for disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  globalMongo.mongoose.conn = null;
  globalMongo.mongoose.promise = null;
});

// Listen for successful connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

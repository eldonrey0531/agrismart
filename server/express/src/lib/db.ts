import mongoose from 'mongoose';
import { config } from '../config';

const connectDB = async () => {
  try {
    await mongoose.connect(config.DATABASE.URL);
    console.log('✔️ MongoDB connection established');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export { connectDB };
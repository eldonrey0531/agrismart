import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = "mongodb+srv://cbanluta180000002002:837829318aA@cluster0.sqn15.mongodb.net/agriculturehub";

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB Atlas connection error:', err);
    process.exit(1);
  });
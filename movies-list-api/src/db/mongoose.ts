import mongoose from 'mongoose';

const DB_URL=process.env.MONGODB_URI;
/**
 * Connects to the MongoDB database using Mongoose.
 * @returns {Promise<void>} A promise that resolves once the connection is established.
 * @throws {Error} If there is an error during the connection attempt.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(`${DB_URL}/movie-list`);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export { connectDB, mongoose };

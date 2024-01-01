import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database using Mongoose.
 * @returns {Promise<void>} A promise that resolves once the connection is established.
 * @throws {Error} If there is an error during the connection attempt.
 */
const connectDB = async () => {
  try {
    const url=process.env.MONGODB_URI;
    if (!url) throw new Error("MONGODB_URI is required");
    await mongoose.connect(url);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed');
    throw error;
  }
};

export { connectDB, mongoose };

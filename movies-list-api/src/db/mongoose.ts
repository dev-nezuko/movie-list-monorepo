import mongoose from 'mongoose';

const connectDB = async () => {
  const url = process.env.MONGODB_URI;
  if (!url) throw new Error('MONGODB_URI is required');
  await mongoose.connect(url);
  console.log('MongoDB connected');
};

export { connectDB, mongoose };

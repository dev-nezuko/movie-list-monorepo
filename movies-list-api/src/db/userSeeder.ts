import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import User from '../models/user';
import { connectDB, mongoose } from './mongoose';

/**
 * Seeds a user in the MongoDB database.
 *
 * If the configured seed email already exists, it is left unchanged.
 *
 * @throws {Error} If there is an error during the seeding process.
 */
async function seedUser() {
  try {
    const email = process.env.SEED_USER_EMAIL;
    const password = process.env.SEED_USER_PASSWORD;
    if (!email || !password || password.length < 12) throw new Error('Configure SEED_USER_EMAIL and a SEED_USER_PASSWORD of at least 12 characters');
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists. Seeder skipped.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    console.log('User seeded successfully.');
  } catch (error) {
    console.error("Local user seeding failed");
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the user seeding script
seedUser();

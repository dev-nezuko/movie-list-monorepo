import bcrypt from 'bcrypt';
import User from '../models/user';
import { connectDB, mongoose } from './mongoose';

/**
 * Seeds a user in the MongoDB database.
 *
 * If a user with the email 'test@example.com' already exists, the seeder is skipped.
 *
 * @throws {Error} If there is an error during the seeding process.
 */
async function seedUser() {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('User already exists. Seeder skipped.');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const newUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
    });

    await newUser.save();

    console.log('User seeded successfully.');
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Execute the user seeding script
seedUser();

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import User from '../models/user';
import { connectDB, mongoose } from './mongoose';

// Creates the one demo account from SEED_USER_EMAIL / SEED_USER_PASSWORD; an existing email is left untouched.
async function seedUser() {
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_USER_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('Configure SEED_USER_EMAIL and a SEED_USER_PASSWORD of at least 12 characters');
  }
  await connectDB();
  try {
    if (await User.exists({ email })) {
      console.log('User already exists. Seeder skipped.');
      return;
    }
    await User.create({ email, password: await bcrypt.hash(password, 10) });
    console.log('User seeded successfully.');
  } finally {
    await mongoose.disconnect();
  }
}

seedUser().catch((error: Error) => {
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
});

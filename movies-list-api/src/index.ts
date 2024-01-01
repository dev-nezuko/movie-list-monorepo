import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { connectDB } from './db/mongoose';
import { jwtSecret } from './config/auth';

async function startServer() {
  jwtSecret();
  await connectDB();
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '127.0.0.1';
  app.listen(port, host, () => console.log(`Movie API listening on ${host}:${port}`));
}

startServer().catch((error: Error) => {
  console.error(`Movie API startup failed: ${error.message}`);
  process.exitCode = 1;
});

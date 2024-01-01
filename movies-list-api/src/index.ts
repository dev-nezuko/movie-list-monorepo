import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { connectDB } from './db/mongoose';
import { jwtSecret } from './config/auth';
async function startServer() {
  jwtSecret();
  await connectDB();
  const port = Number(process.env.PORT || 3001);
  app.listen(port, '127.0.0.1', () => console.log(`Movie API listening on localhost:${port}`));
}
startServer().catch(() => {console.error('Movie API startup failed; check local configuration');process.exitCode = 1;});

import express from 'express';
const cors = require('cors');
import userRouter from './routes/user';
import movieRouter from './routes/movie';
import { connectDB } from './db/mongoose';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routers
app.use(userRouter);
app.use(movieRouter);

// Database connection
connectDB();

export default app;

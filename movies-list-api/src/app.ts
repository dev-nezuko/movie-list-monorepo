import express from 'express';
const cors = require('cors');
import userRouter from './routes/user';
import movieRouter from './routes/movie';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routers
app.use(userRouter);
app.use(movieRouter);


export default app;

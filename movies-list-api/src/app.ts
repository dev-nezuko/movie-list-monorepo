import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import movieRouter from './routes/movie';

export function allowedOrigins(value = process.env.CORS_ORIGIN): string[] {
  return (value || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Behind a reverse proxy, set TRUST_PROXY to its hop count so rate limits see client addresses.
export function trustProxy(value = process.env.TRUST_PROXY): number | boolean {
  const hops = Number(value);
  return Number.isInteger(hops) && hops > 0 ? hops : false;
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', trustProxy());
app.use(cors({ origin: allowedOrigins() }));
app.use(express.json({ limit: '10kb' }));

app.use(userRouter);
app.use(movieRouter);

// body-parser errors carry a status; without this Express answers with an HTML stack page.
app.use((error: { status?: number; type?: string }, _req: Request, res: Response, next: NextFunction) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Malformed JSON body' });
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body too large' });
  next(error);
});

export default app;

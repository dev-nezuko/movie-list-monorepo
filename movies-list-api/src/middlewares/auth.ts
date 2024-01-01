import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import { jwtSecret } from '../config/auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser | null;
    token?: string;
  }
}

// A valid signature is not enough: the token must still be the one stored on the account,
// so a newer login or a logout revokes it.
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Missing token' });
    }

    const decoded = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] }) as { userId: string };
    const user = await User.findOne({ _id: decoded.userId, authToken: token });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

export default authMiddleware;

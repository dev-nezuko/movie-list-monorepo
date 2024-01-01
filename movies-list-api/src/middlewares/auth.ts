import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
      token?: string;
    }
  }
}

/**
 * Middleware for authenticating and authorizing users based on JWT tokens.
 * Checks for a valid JWT token in the 'Authorization' header.
 * Verifies the token's signature and looks up the user in the database.
 * Sets the authenticated user and token on the request object.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function to pass control to the next middleware.
 *
 * @throws {Error} If the token is missing, invalid, or the corresponding user is not found in the database.
 */

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Missing token' });
    }

    const decoded = jwt.verify(token, 'your-secret-key') as { userId: string };
    const user = await User.findOne({ _id: decoded.userId, authToken: token });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

export default authMiddleware;

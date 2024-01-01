import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import authMiddleware from '../middlewares/auth';
import { jwtSecret } from '../config/auth';

const userRouter = express.Router();

/**
 * Endpoint for user login.
 */
userRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({message: "Email and password strings are required"});
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret(), {
      algorithm: 'HS256',
      expiresIn: '1h',
    });

    user.authToken = token;
    await user.save();

    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Endpoint for user logout.
 */
userRouter.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    user.authToken = undefined;
    await user.save();
    res.status(200).json({message: 'Logout successful'});
  } catch {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export default userRouter;

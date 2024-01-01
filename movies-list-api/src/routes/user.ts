import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const userRouter = express.Router();

/**
 * Endpoint for user login.
 */
userRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
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
userRouter.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decodedToken: any = jwt.verify(token, 'your-secret-key');

    const user = await User.findById(decodedToken.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    user.authToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default userRouter;

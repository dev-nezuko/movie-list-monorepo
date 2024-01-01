import express, { Request as ExpressRequest, Response, NextFunction } from 'express';
const multer = require('multer');
import authMiddleware from '../middlewares/auth';
import Movie from '../models/movie';
import { mongoose } from '../db/mongoose';

interface MulterRequest extends ExpressRequest {
  file?: {
    buffer?: Buffer;
  };
}

const movieRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: {fileSize: 5 * 1024 * 1024, files: 1, fields: 2} });

movieRouter.post('/movies', authMiddleware, upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    const { title, publicationYear } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const parsedYear = Number(publicationYear);
    if (!title || !publicationYear || Number.isNaN(parsedYear) || !imageBuffer) {
      return res.status(400).json({ message: 'Incomplete data' });
    }

    const movie = new Movie({
      title,
      image: imageBuffer,
      publishYear: parsedYear,
      userId: req.user?._id,
    });

    await movie.save();

    res.status(201).json({ message: 'Movie created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.get('/movies', authMiddleware, async (req: MulterRequest, res: Response) => {
  try {
    const rawPage = req.query.page as string | undefined;
    const rawPageSize = req.query.pageSize as string | undefined;

    const page = rawPage !== undefined ? Number(rawPage) : 1;
    const pageSize = rawPageSize !== undefined ? Number(rawPageSize) : 10;

    if (!Number.isInteger(page) || !Number.isInteger(pageSize) || page < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const skip = (page - 1) * pageSize;

    const movies = await Movie.find({ userId: req.user?._id })
      .skip(skip)
      .limit(pageSize)
      .exec();

    res.status(200).json({ movies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.get('/movies/:id', authMiddleware, async (req: MulterRequest, res: Response) => {
  try {
    const movieId = req.params.id;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID format' });
    }

    const movie = await Movie.findOne({ _id: movieId, userId: req.user?._id }).exec();

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found or unauthorized to access' });
    }

    res.status(200).json({ movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.put('/movies/:id', authMiddleware, upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    const { title, publicationYear } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const parsedYear = Number(publicationYear);
    if (!title || !publicationYear || Number.isNaN(parsedYear)) {
      return res.status(400).json({ message: 'Incomplete data' });
    }

    const movieId = req.params.id;

    if (!mongoose.isValidObjectId(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID format' });
    }

    const updatePayload: Partial<{ title: string; image: Buffer | null; publishYear: number }> = {
      title,
      publishYear: parsedYear,
    };

    if (imageBuffer) {
      updatePayload.image = imageBuffer;
    }

    const updatedMovie = await Movie.findOneAndUpdate(
      { _id: movieId, userId: req.user?._id },
      { $set: updatePayload },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found or unauthorized to update' });
    }

    res.status(200).json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.use((error: {code?: string}, _req: ExpressRequest, res: Response, next: NextFunction) => {
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({message: 'Image must be no larger than 5 MiB'});
  if (error.code?.startsWith('LIMIT_')) return res.status(400).json({message: 'Invalid multipart upload'});
  next(error);
});
export default movieRouter;

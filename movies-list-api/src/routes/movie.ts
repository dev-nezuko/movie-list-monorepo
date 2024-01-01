import express, { Request as ExpressRequest, Response } from 'express';
const multer = require('multer');
import authMiddleware from '../middlewares/auth';
import Movie from '../models/movie';

interface MulterRequest extends ExpressRequest {
  file?: {
    buffer?: Buffer;
  };
}

const movieRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Endpoint for creating a new movie.
 */
movieRouter.post('/movies', authMiddleware, upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    const { title, publicationYear } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    if (!title || !publicationYear || !imageBuffer) {
      return res.status(400).json({ message: 'Incomplete data' });
    }

    const movie = new Movie({
      title,
      image: imageBuffer,
      publishYear: publicationYear,
      userId: req.user?._id,
    });

    await movie.save();

    res.status(201).json({ message: 'Movie created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Endpoint for fetching a paginated list of movies.
 */
movieRouter.get('/movies', authMiddleware, async (req: MulterRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

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

/**
 * Endpoint for fetching details of a specific movie by ID.
 */
movieRouter.get('/movies/:id', authMiddleware, async (req: MulterRequest, res: Response) => {
  try {
    const movieId = req.params.id;

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

/**
 * Endpoint for updating details of a specific movie by ID.
 */
movieRouter.put('/movies/:id', authMiddleware, upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    const { title, publicationYear } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    if (!title || !publicationYear) {
      return res.status(400).json({ message: 'Incomplete data' });
    }

    const movieId = req.params.id;

    const updatedMovie = await Movie.findOneAndUpdate(
      { _id: movieId, userId: req.user?._id },
      {
        $set: {
          title,
          image: imageBuffer,
          publishYear: publicationYear,
        },
      },
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

export default movieRouter;

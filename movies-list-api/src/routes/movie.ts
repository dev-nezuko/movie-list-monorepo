import express, { Request as ExpressRequest, Response, NextFunction } from 'express';
import multer from 'multer';
import authMiddleware from '../middlewares/auth';
import Movie, { IMovie } from '../models/movie';
import { mongoose } from '../db/mongoose';
import { detectPosterType, parseTitle, parseYear, TITLE_MAX_LENGTH } from '../validation/movie';

const INVALID_FIELDS = `Give a title of 1-${TITLE_MAX_LENGTH} characters and a four-digit publication year`;
const UNSUPPORTED_IMAGE = 'Posters must be PNG or JPEG images';
const NOT_FOUND = 'Movie not found';
// Poster bytes are only sent by the poster route, so lists stay small.
const WITHOUT_IMAGE = '-image';

const movieRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 2 } });

function validMovieId(req: ExpressRequest, res: Response): string | null {
  if (mongoose.isValidObjectId(req.params.id)) return req.params.id;
  res.status(400).json({ message: 'Invalid movie ID format' });
  return null;
}

movieRouter.post('/movies', authMiddleware, upload.single('image'), async (req: ExpressRequest, res: Response) => {
  try {
    const title = parseTitle(req.body.title);
    const year = parseYear(req.body.publicationYear);
    if (!title || !year) return res.status(400).json({ message: INVALID_FIELDS });

    const imageBuffer = req.file?.buffer;
    if (!imageBuffer) return res.status(400).json({ message: 'A poster image is required' });
    const imageType = detectPosterType(imageBuffer);
    if (!imageType) return res.status(415).json({ message: UNSUPPORTED_IMAGE });

    const movie = new Movie({
      title,
      image: imageBuffer,
      imageType,
      publishYear: year,
      userId: req.user?._id,
    });

    await movie.save();

    res.status(201).json({ message: 'Movie created successfully', movie: { _id: movie._id, title, publishYear: year } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.get('/movies', authMiddleware, async (req: ExpressRequest, res: Response) => {
  try {
    const rawPage = req.query.page as string | undefined;
    const rawPageSize = req.query.pageSize as string | undefined;

    const page = rawPage !== undefined ? Number(rawPage) : 1;
    const pageSize = rawPageSize !== undefined ? Number(rawPageSize) : 10;

    if (!Number.isInteger(page) || !Number.isInteger(pageSize) || page < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const owner = { userId: req.user?._id };
    const [movies, total] = await Promise.all([
      Movie.find(owner)
        .select(WITHOUT_IMAGE)
        .sort({ _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      Movie.countDocuments(owner).exec(),
    ]);

    res.status(200).json({ movies, page, pageSize, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.get('/movies/:id', authMiddleware, async (req: ExpressRequest, res: Response) => {
  try {
    const movieId = validMovieId(req, res);
    if (!movieId) return;

    const movie = await Movie.findOne({ _id: movieId, userId: req.user?._id }).select(WITHOUT_IMAGE).exec();
    if (!movie) return res.status(404).json({ message: NOT_FOUND });

    res.status(200).json({ movie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.get('/movies/:id/poster', authMiddleware, async (req: ExpressRequest, res: Response) => {
  try {
    const movieId = validMovieId(req, res);
    if (!movieId) return;

    const movie = await Movie.findOne({ _id: movieId, userId: req.user?._id }).select('image imageType').exec();
    if (!movie?.image) return res.status(404).json({ message: NOT_FOUND });

    // Records saved before imageType existed fall back to sniffing.
    const type = movie.imageType || detectPosterType(movie.image) || 'application/octet-stream';
    res.set({ 'Content-Type': type, 'Cache-Control': 'private, no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.status(200).send(movie.image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.put('/movies/:id', authMiddleware, upload.single('image'), async (req: ExpressRequest, res: Response) => {
  try {
    const movieId = validMovieId(req, res);
    if (!movieId) return;

    const title = parseTitle(req.body.title);
    const year = parseYear(req.body.publicationYear);
    if (!title || !year) return res.status(400).json({ message: INVALID_FIELDS });

    const updatePayload: Partial<Pick<IMovie, 'title' | 'image' | 'imageType' | 'publishYear'>> = { title, publishYear: year };

    const imageBuffer = req.file?.buffer;
    if (imageBuffer) {
      const imageType = detectPosterType(imageBuffer);
      if (!imageType) return res.status(415).json({ message: UNSUPPORTED_IMAGE });
      updatePayload.image = imageBuffer;
      updatePayload.imageType = imageType;
    }

    const updatedMovie = await Movie.findOneAndUpdate(
      { _id: movieId, userId: req.user?._id },
      { $set: updatePayload },
      { new: true, projection: WITHOUT_IMAGE }
    );

    if (!updatedMovie) return res.status(404).json({ message: NOT_FOUND });

    res.status(200).json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

movieRouter.delete('/movies/:id', authMiddleware, async (req: ExpressRequest, res: Response) => {
  try {
    const movieId = validMovieId(req, res);
    if (!movieId) return;

    const result = await Movie.deleteOne({ _id: movieId, userId: req.user?._id }).exec();
    if (result.deletedCount === 0) return res.status(404).json({ message: NOT_FOUND });

    res.status(204).end();
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

import mongoose, { Schema, Document } from 'mongoose';
import { PosterType } from '../validation/movie';

export interface IMovie extends Document {
  title: string;
  image: Buffer;
  imageType?: PosterType;
  publishYear: number;
  userId: mongoose.Types.ObjectId;
}

const movieSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  image: { type: Buffer, required: true },
  imageType: { type: String, enum: ['image/png', 'image/jpeg'] },
  publishYear: { type: Number, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true },
});

// Every list query filters by owner and sorts newest first.
movieSchema.index({ userId: 1, _id: -1 });

const Movie = mongoose.model<IMovie>('Movie', movieSchema);

export default Movie;

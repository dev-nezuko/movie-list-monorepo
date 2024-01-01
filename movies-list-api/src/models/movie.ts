import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  image: Buffer;
  publishYear: number;
  userId: mongoose.Types.ObjectId;
}

const movieSchema: Schema = new Schema({
  title: { type: String, required: true },
  image: { type: Buffer, required: true },
  publishYear: { type: Number, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true },
});

const Movie = mongoose.model<IMovie>('Movie', movieSchema);

export default Movie;

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  authToken: string | null | undefined;
}

const userSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authToken: { type: String, default: null },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;

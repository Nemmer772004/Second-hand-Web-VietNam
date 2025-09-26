import mongoose, { Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
}

const sessionSchema = new mongoose.Schema<ISession>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
    index: { expires: 0 },
  },
  revokedAt: {
    type: Date,
    default: null,
  },
});

const Session = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);
export default Session;

import mongoose, { Document, Schema, Model } from 'mongoose';
import { TokenType } from '../types/enums';

export interface IToken extends Document {
  token: string;
  type: TokenType;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

interface ITokenModel extends Model<IToken> {
  findValidToken(token: string, type: TokenType): Promise<IToken | null>;
  removeExpiredTokens(): Promise<void>;
}

const TokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: Object.values(TokenType),
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0 // TTL index - MongoDB will automatically remove expired documents
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
TokenSchema.index({ userId: 1, type: 1 });
TokenSchema.index({ token: 1 }, { unique: true });

// Static methods
TokenSchema.statics.findValidToken = async function(
  token: string,
  type: TokenType
): Promise<IToken | null> {
  return this.findOne({
    token,
    type,
    expiresAt: { $gt: new Date() }
  });
};

TokenSchema.statics.removeExpiredTokens = async function(): Promise<void> {
  await this.deleteMany({
    expiresAt: { $lte: new Date() }
  });
};

// Create TTL index for automatic token cleanup
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model<IToken, ITokenModel>('Token', TokenSchema);

// Token cleanup job - runs every hour
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    try {
      await Token.removeExpiredTokens();
    } catch (error) {
      console.error('Token cleanup error:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
}
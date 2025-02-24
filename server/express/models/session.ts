import { Schema, model, Document, Model } from "mongoose";

interface ISession {
  userId: string;
  token: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDocument extends ISession, Document {
  isExpired(): boolean;
}

export interface SessionModel extends Model<SessionDocument> {
  findValidSession(token: string): Promise<SessionDocument | null>;
  deleteMany(filter: Record<string, any>): Promise<{ deletedCount: number }>;
}

const sessionSchema = new Schema<SessionDocument, SessionModel>({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userAgent: String,
  ip: String,
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
sessionSchema.index({ token: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Instance method to check if session is expired
sessionSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

// Static method to find valid session
sessionSchema.statics.findValidSession = async function(
  token: string
): Promise<SessionDocument | null> {
  return this.findOne({
    token,
    expiresAt: { $gt: new Date() },
  });
};

// Middleware to cleanup expired sessions
sessionSchema.pre("save", async function() {
  if (this.isNew) {
    // Clean up expired sessions for this user
    const Model = this.constructor as SessionModel;
    await Model.deleteMany({
      userId: this.userId,
      expiresAt: { $lt: new Date() },
    });
  }
});

export const Session = model<SessionDocument, SessionModel>("Session", sessionSchema);
export type { ISession };
export default Session;
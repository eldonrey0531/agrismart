import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserRole,
  UserStatus,
  UserDocument,
  UserModel,
  UserFields,
  UserMethods,
} from '../types/user';

interface SessionData {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  deviceInfo: string;
  ipAddress: string;
}

const sessionSchema = new Schema<SessionData>({
  id: String,
  createdAt: Date,
  lastActivity: Date,
  deviceInfo: String,
  ipAddress: String,
}, { _id: false });

const userSchema = new Schema<UserDocument, UserModel>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  image: String,
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  accountLevel: {
    type: String,
    default: 'basic',
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING,
  },
  statusReason: String,
  statusUpdatedAt: Date,
  statusUpdatedBy: String,
  
  // Email verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: Date,
  verificationToken: String,
  lastVerificationEmailSent: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordReset: Date,
  lastPasswordResetRequest: Date,
  
  // Seller verification
  sellerVerification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
    documentId: String,
    documentType: String,
    verifiedAt: Date,
    verifiedBy: String,
    rejectionReason: String,
  },
  
  // Notification preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
  },

  // Session management
  lastActivity: Date,
  sessionVersion: {
    type: Number,
    default: 0,
  },
  lastLoginAt: Date,
  lastLoginIp: String,
  currentSessionId: String,
  activeSessions: [sessionSchema],
  
  // Account deletion
  deletedAt: Date,
  deletedBy: String,
  deletionReason: String,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Check if password is expired
userSchema.methods.isPasswordExpired = function(): boolean {
  if (!this.lastPasswordReset) return false;
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  return this.lastPasswordReset < ninetyDaysAgo;
};

// Update last activity
userSchema.methods.updateLastActivity = function(): void {
  this.lastActivity = new Date();
};

// Add a new session
userSchema.methods.addSession = function(sessionInfo: Omit<SessionData, 'createdAt' | 'lastActivity'>): void {
  const session: SessionData = {
    ...sessionInfo,
    createdAt: new Date(),
    lastActivity: new Date(),
  };

  this.activeSessions.push(session);
  this.currentSessionId = session.id;
  this.lastLoginAt = new Date();
  this.lastLoginIp = session.ipAddress;
};

// Remove a session
userSchema.methods.removeSession = function(sessionId: string): void {
  this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
  if (this.currentSessionId === sessionId) {
    this.currentSessionId = undefined;
  }
};

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ lastActivity: 1 });
userSchema.index({ "sellerVerification.status": 1 });
userSchema.index({ deletedAt: 1 });

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

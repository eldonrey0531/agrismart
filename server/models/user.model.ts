import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from './user.types';

const userSchema = new mongoose.Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      'Please enter a valid email address'
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  name: {
    type: String,
    default: null,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

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
    throw error;
  }
};

// Delete password when converting to JSON
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Delete password when converting to Object
userSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const UserModel = mongoose.models.User as mongoose.Model<IUserDocument> || 
  mongoose.model<IUserDocument>('User', userSchema);
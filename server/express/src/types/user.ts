import { Types } from 'mongoose';

export interface BaseUser {
  _id: Types.ObjectId | string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  accountLevel: 'basic' | 'premium' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  sessionVersion: number;
  isVerified: boolean;
}

// Used for JWT token payload
export interface TokenUser {
  _id: Types.ObjectId | string;
  email: string;
  role: 'admin' | 'user';
  sessionVersion: number;
}

// Used in request objects
export interface AuthenticatedUser extends BaseUser {
  lastLoginAt?: Date;
  activeSessions: string[];
}

// Used for database operations
export interface UserDocument extends BaseUser {
  password: string;
  comparePassword(password: string): Promise<boolean>;
  activeSessions: string[];
  createdAt: Date;
  updatedAt: Date;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
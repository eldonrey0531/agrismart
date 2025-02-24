import { UserRole, AccountLevel, UserStatus } from '../models/types/user';

export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  accountLevel: AccountLevel;
  status: UserStatus;
  isVerified: boolean;
  sessionVersion: number;
  lastLoginAt: Date;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  sessionVersion: number;
}
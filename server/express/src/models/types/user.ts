export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type AccountLevel = 'basic' | 'premium' | 'enterprise';

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  mobile: string;
  role: UserRole;
  accountLevel: AccountLevel;
  status: UserStatus;
  isVerified: boolean;
  sessionVersion: number;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  activeSessions: string[];
  lastLoginAt: Date;
  lastVerificationEmailSent?: Date;
  verifiedAt?: Date;
  statusUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
}
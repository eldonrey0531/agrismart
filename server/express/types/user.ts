import { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SELLER = 'seller',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export interface SessionData {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  deviceInfo: string;
  ipAddress: string;
}

export interface SellerVerification {
  status?: 'pending' | 'approved' | 'rejected';
  documentId?: string;
  documentType?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Base user fields without Mongoose specifics
export interface UserFields {
  email: string;
  name: string;
  password: string;
  mobile: string;
  image?: string;
  role: UserRole;
  accountLevel: string;
  status: UserStatus;
  statusReason?: string;
  statusUpdatedAt?: Date;
  statusUpdatedBy?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationToken?: string;
  lastVerificationEmailSent?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastPasswordReset?: Date;
  lastPasswordResetRequest?: Date;
  lastActivity?: Date;
  sessionVersion: number;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  currentSessionId?: string;
  deletedAt?: Date;
  deletedBy?: string;
  deletionReason?: string;
  notificationPreferences: NotificationPreferences;
  activeSessions: SessionData[];
  sellerVerification: SellerVerification;
  createdAt: Date;
  updatedAt: Date;
}

// Methods available on the user document
export interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPasswordExpired(): boolean;
  updateLastActivity(): void;
  addSession(sessionInfo: Omit<SessionData, 'createdAt' | 'lastActivity'>): void;
  removeSession(sessionId: string): void;
}

// Mongoose User Model with static methods
export interface UserModel extends Model<UserDocument> {
  // Add static methods here if needed
}

// Complete User Document type including Mongoose document methods
export interface UserDocument extends Document, UserFields, UserMethods {
  id: string;
  _id: ObjectId;
}

// API response type
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  mobile: string;
  image?: string;
  role: UserRole;
  accountLevel: string;
  status: UserStatus;
  isVerified: boolean;
  lastActivity?: Date;
  lastLoginAt?: Date;
  notificationPreferences: NotificationPreferences;
  sellerVerification?: SellerVerification;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Mongoose document to API response type
 */
export function toAuthUser(doc: UserDocument): AuthUser {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    mobile: doc.mobile,
    image: doc.image,
    role: doc.role,
    accountLevel: doc.accountLevel,
    status: doc.status,
    isVerified: doc.isVerified,
    lastActivity: doc.lastActivity,
    lastLoginAt: doc.lastLoginAt,
    notificationPreferences: doc.notificationPreferences,
    sellerVerification: doc.sellerVerification,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Check if a user document has a valid session
 */
export function hasValidSession(doc: UserDocument): boolean {
  if (!doc.lastActivity) return false;
  
  const sessionTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const expirationTime = new Date(doc.lastActivity.getTime() + sessionTTL);
  return new Date() <= expirationTime;
}

/**
 * Type guard to check if an object is a UserDocument
 */
export function isUserDocument(obj: any): obj is UserDocument {
  return obj && 
    typeof obj === 'object' && 
    '_id' in obj &&
    'email' in obj &&
    'role' in obj;
}

/**
 * Convert partial user data to AuthUser
 */
export function toPartialAuthUser(data: Partial<UserDocument>): Partial<AuthUser> {
  const authUser: Partial<AuthUser> = {};
  
  if (data._id) authUser.id = data._id.toString();
  if (data.email) authUser.email = data.email;
  if (data.name) authUser.name = data.name;
  if (data.mobile) authUser.mobile = data.mobile;
  if (data.image) authUser.image = data.image;
  if (data.role) authUser.role = data.role;
  if (data.accountLevel) authUser.accountLevel = data.accountLevel;
  if (data.status) authUser.status = data.status;
  if (data.isVerified !== undefined) authUser.isVerified = data.isVerified;
  if (data.lastActivity) authUser.lastActivity = data.lastActivity;
  if (data.lastLoginAt) authUser.lastLoginAt = data.lastLoginAt;
  if (data.notificationPreferences) {
    authUser.notificationPreferences = data.notificationPreferences;
  }
  if (data.sellerVerification) {
    authUser.sellerVerification = data.sellerVerification;
  }
  if (data.createdAt) authUser.createdAt = data.createdAt;
  if (data.updatedAt) authUser.updatedAt = data.updatedAt;

  return authUser;
}
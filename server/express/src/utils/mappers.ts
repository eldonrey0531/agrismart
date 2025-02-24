import { AuthUser, BaseUser } from '../types/auth.types';
import { Types } from 'mongoose';
import { ApiError } from '../types/error';

/**
 * Maps a database user object to the AuthUser interface
 * @throws {ApiError} if user data is invalid
 */
export const mapUserToAuthUser = (user: Record<string, any>): AuthUser => {
  if (!user) {
    throw new ApiError('Invalid user data', 'INVALID_USER_DATA', 500);
  }

  // Validate required fields
  if (!user._id || !user.email || !user.name || !user.role || !user.status) {
    throw new ApiError('Missing required user fields', 'INVALID_USER_DATA', 500);
  }

  // Map base user properties
  const baseUser: BaseUser = {
    id: user._id instanceof Types.ObjectId ? user._id.toString() : user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status
  };

  // Add optional and date properties
  const authUser: AuthUser = {
    ...baseUser,
    emailVerified: user.emailVerified || null,
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt || Date.now()),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt || Date.now())
  };

  return authUser;
};

/**
 * Remove sensitive fields from user data and convert to AuthUser
 * @throws {ApiError} if user data is invalid
 */
export const sanitizeUser = (user: Record<string, any>): AuthUser => {
  if (!user) {
    throw new ApiError('Invalid user data', 'INVALID_USER_DATA', 500);
  }

  try {
    const userData = user.toJSON ? user.toJSON() : user;
    const { password, __v, ...rest } = userData;
    return mapUserToAuthUser(rest);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to process user data',
      'USER_PROCESSING_ERROR',
      500
    );
  }
};
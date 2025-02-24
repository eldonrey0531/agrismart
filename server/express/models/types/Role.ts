export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SELLER = 'seller',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  mobile: string;
  image?: string;
  role: UserRole;
  status: UserStatus;
  accountLevel: string;
  isVerified: boolean;
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthUser = BaseUser;

/**
 * Type guard for user roles
 */
export const isValidRole = (role: unknown): role is UserRole => {
  return typeof role === 'string' && Object.values(UserRole).includes(role as UserRole);
};

/**
 * Type guard for user status
 */
export const isValidStatus = (status: unknown): status is UserStatus => {
  return typeof status === 'string' && Object.values(UserStatus).includes(status as UserStatus);
};

/**
 * Type guard for notification preferences
 */
export const isValidNotificationPreferences = (
  prefs: unknown
): prefs is NotificationPreferences => {
  if (!prefs || typeof prefs !== 'object') return false;
  
  const p = prefs as Partial<NotificationPreferences>;
  return (
    typeof p.email === 'boolean' &&
    typeof p.push === 'boolean' &&
    typeof p.sms === 'boolean'
  );
};

/**
 * Type guard for base user
 */
export const isBaseUser = (user: unknown): user is BaseUser => {
  if (!user || typeof user !== 'object') return false;
  
  const u = user as Partial<BaseUser>;
  return (
    typeof u.id === 'string' &&
    typeof u.email === 'string' &&
    typeof u.name === 'string' &&
    typeof u.mobile === 'string' &&
    isValidRole(u.role) &&
    isValidStatus(u.status) &&
    typeof u.accountLevel === 'string' &&
    typeof u.isVerified === 'boolean' &&
    isValidNotificationPreferences(u.notificationPreferences) &&
    u.createdAt instanceof Date &&
    u.updatedAt instanceof Date
  );
};
import { z } from 'zod';

// Nested object schemas
export const emailNotificationsSchema = z.object({
  security: z.boolean(),
  marketing: z.boolean(),
  updates: z.boolean(),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'connections']),
  showEmail: z.boolean(),
  showLocation: z.boolean(),
});

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string().min(2).max(10),
  timezone: z.string(),
});

// Main profile schema
export const userProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().max(200).optional(),
  avatar: z.custom<File | null>()
    .nullable()
    .refine(
      (file) => !file || file.size <= 2 * 1024 * 1024,
      'Avatar must be less than 2MB'
    ),
  emailNotifications: emailNotificationsSchema,
  privacySettings: privacySettingsSchema,
  preferences: preferencesSchema,
});

// TypeScript types
export type EmailNotifications = z.infer<typeof emailNotificationsSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

// Default values
export const defaultUserProfile: UserProfile = {
  displayName: '',
  bio: '',
  location: '',
  website: '',
  avatar: null,
  emailNotifications: {
    security: true,
    marketing: false,
    updates: true,
  },
  privacySettings: {
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
  },
  preferences: {
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
};

// Form field paths type with proper typing
export type UserProfileFieldPath =
  | keyof UserProfile
  | `emailNotifications.${keyof EmailNotifications}`
  | `privacySettings.${keyof PrivacySettings}`
  | `preferences.${keyof Preferences}`;

// Type-safe nested value getter
export function getNestedValue<
  T extends UserProfile,
  P extends UserProfileFieldPath
>(obj: T, path: P): unknown {
  const parts = path.split('.');
  let result: unknown = obj;
  
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = (result as any)[part];
    } else {
      return undefined;
    }
  }
  
  return result;
}

// Type-safe nested value setter
export function setNestedValue<
  T extends UserProfile,
  P extends UserProfileFieldPath
>(obj: T, path: P, value: unknown): T {
  const parts = path.split('.');
  
  if (parts.length === 1) {
    return {
      ...obj,
      [path]: value,
    };
  }

  const [first, ...rest] = parts;
  const subPath = rest.join('.');
  
  return {
    ...obj,
    [first]: {
      ...(obj[first as keyof T] as object),
      [subPath]: value,
    },
  } as T;
}

export type UserProfileFormData = {
  path: UserProfileFieldPath;
  value: unknown;
};

export type UserProfileUpdateHandler = (data: UserProfileFormData) => void;
import * as z from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export const userProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  website: z
    .string()
    .url('Please enter a valid URL')
    .max(200, 'Website URL must be less than 200 characters')
    .optional(),
  
  avatar: z.custom<File | null>()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      'Image must be less than 2MB'
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .gif formats are supported'
    )
    .nullable(),

  emailNotifications: z.object({
    marketing: z.boolean(),
    security: z.boolean(),
    updates: z.boolean(),
  }),

  privacySettings: z.object({
    profileVisibility: z.enum(['public', 'private', 'connections']),
    showEmail: z.boolean(),
    showLocation: z.boolean(),
  }),

  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string().min(2).max(10),
    timezone: z.string(),
  }),
});

export type UserProfileData = z.infer<typeof userProfileSchema>;

export const userProfileDefaultValues: UserProfileData = {
  displayName: '',
  bio: '',
  location: '',
  website: '',
  avatar: null,
  emailNotifications: {
    marketing: false,
    security: true,
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
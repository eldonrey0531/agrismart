import * as z from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2).max(100).nullish(),
  bio: z.string().max(500).nullish(),
  location: z.string().max(100).nullish(),
  website: z.string().url().max(100).nullish(),
  company: z.string().max(100).nullish(),
  title: z.string().max(100).nullish(),
  // Social links
  twitter: z.string().max(100).nullish()
    .refine(val => !val || val.startsWith('@') || val.startsWith('https://twitter.com/'), {
      message: 'Twitter handle must start with @ or be a valid Twitter URL'
    }),
  github: z.string().max(100).nullish()
    .refine(val => !val || !val.includes('https://') || val.startsWith('https://github.com/'), {
      message: 'Must be a valid GitHub username or URL'
    }),
  linkedin: z.string().url().max(100).nullish()
    .refine(val => !val || val.startsWith('https://www.linkedin.com/'), {
      message: 'Must be a valid LinkedIn URL'
    }),
  // Preferences
  emailNotifications: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
  marketplaceUpdates: z.boolean().optional()
})

export const profileUpdateSchema = profileSchema.partial()

export type ProfileFormData = z.infer<typeof profileSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

// Validation errors
export class ValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super('Profile validation failed')
    this.name = 'ValidationError'
  }
}

// Validate profile data
export function validateProfileData(data: unknown): ProfileUpdateData {
  const result = profileUpdateSchema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(result.error)
  }
  return result.data
}
/**
 * Validation utilities for user data
 */

// Email validation (RFC 5322 Official Standard)
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Password requirements:
// - At least 8 characters
// - Contains uppercase
// - Contains lowercase
// - Contains number
// - Contains special character
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Phone number (E.164 format)
const PHONE_PATTERN = /^\+[1-9]\d{1,14}$/

// Username validation
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,16}$/

// Image file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  PROFILE_PICTURE: 5 * 1024 * 1024, // 5MB
  PRODUCT_IMAGE: 10 * 1024 * 1024,  // 10MB
  ATTACHMENT: 20 * 1024 * 1024      // 20MB
}

export function isEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  if (email.length > 254) return false
  return EMAIL_PATTERN.test(email)
}

export function isStrongPassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { 
      valid: false, 
      message: 'Password is required' 
    }
  }

  const checks = [
    { 
      test: password.length >= 8,
      message: 'Password must be at least 8 characters long'
    },
    {
      test: /[A-Z]/.test(password),
      message: 'Password must contain at least one uppercase letter'
    },
    {
      test: /[a-z]/.test(password),
      message: 'Password must contain at least one lowercase letter'
    },
    {
      test: /\d/.test(password),
      message: 'Password must contain at least one number'
    },
    {
      test: /[@$!%*?&]/.test(password),
      message: 'Password must contain at least one special character (@$!%*?&)'
    }
  ]

  const failedChecks = checks.filter(check => !check.test)
  
  if (failedChecks.length > 0) {
    return {
      valid: false,
      message: failedChecks[0].message,
      details: failedChecks.map(check => check.message)
    }
  }

  return { valid: true }
}

export function isValidPhoneNumber(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return {
      valid: false,
      message: 'Phone number is required'
    }
  }

  if (!PHONE_PATTERN.test(phone)) {
    return {
      valid: false,
      message: 'Invalid phone number format. Use international format: +{country}{number}'
    }
  }

  return { valid: true }
}

export function isValidUsername(username: string): ValidationResult {
  if (!username || typeof username !== 'string') {
    return {
      valid: false,
      message: 'Username is required'
    }
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      valid: false,
      message: 'Username must be 3-16 characters long and contain only letters, numbers, underscores, and hyphens'
    }
  }

  return { valid: true }
}

export function isValidImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type)
}

export function isValidFileSize(size: number, type: keyof typeof FILE_SIZE_LIMITS): boolean {
  return size <= FILE_SIZE_LIMITS[type]
}

// Validation result type
interface ValidationResult {
  valid: boolean
  message?: string
  details?: string[]
}

export type { ValidationResult }
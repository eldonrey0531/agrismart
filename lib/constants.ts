export const APP_NAME = 'AgriSmart Platform';
export const APP_DESCRIPTION = 'Smart agricultural management platform for modern farming';

export const COMPANY = {
  name: 'AgriSmart',
  address: '123 Farm Street, Agri City, AC 12345',
  email: 'contact@agrismart.com',
  phone: '+1 (555) 123-4567',
} as const;

// Authentication Configuration
export const AUTH = {
  TOKEN_NAME: 'auth_token',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  MIN_PASSWORD_LENGTH: 6,
  ROLES: {
    GUEST: 'guest',
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  },
  ACCOUNT_LEVELS: {
    BUYER: 'buyer',
    SELLER: 'seller',
  },
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended',
  },
} as const;

// Validation Rules
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  PASSWORD_MIN_LENGTH: AUTH.MIN_PASSWORD_LENGTH,
  EMAIL_PATTERN: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  DEFAULT: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_EXISTS: 'User already exists.',
    WEAK_PASSWORD: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_TOKEN: 'Invalid authentication token.',
    NOT_AUTHENTICATED: 'Please log in to continue.',
    TOKEN_REQUIRED: 'Authentication token is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address to continue.',
    ACCOUNT_SUSPENDED: 'Your account has been suspended.',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
    SELLER_APPROVAL_PENDING: 'Your seller account is pending approval.',
  },
  VALIDATION: {
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  },
  API: {
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'You do not have permission to perform this action',
    RATE_LIMIT: 'Too many requests. Please try again later',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Logged in successfully.',
    REGISTER: 'Account created successfully.',
    LOGOUT: 'Logged out successfully.',
    PASSWORD_RESET: 'Password reset successfully.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    SELLER_REQUEST_SUBMITTED: 'Seller upgrade request submitted successfully.',
    SELLER_APPROVED: 'Your seller account has been approved.',
  },
  FORM: {
    SAVED: 'Changes saved successfully.',
    DELETED: 'Item deleted successfully.',
    UPDATED: 'Item updated successfully.',
  },
} as const;

// API Rate Limiting
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const;

// Cache Configuration
export const CACHE = {
  DEFAULT_TTL: 60 * 60, // 1 hour in seconds
  PRODUCTS_TTL: 5 * 60, // 5 minutes
  USER_TTL: 15 * 60, // 15 minutes
} as const;
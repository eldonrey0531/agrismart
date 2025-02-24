import { z } from 'zod';

// Form validation configuration
export const FORM_VALIDATION = {
  TEXT_MIN: 2,
  TEXT_MAX: 100,
  TEXTAREA_MAX: 1000,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 100,
  URL_MAX: 2083,
  FILE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
};

// Form input validation patterns
export const FORM_PATTERNS = {
  NAME: /^[a-zA-Z\s-']+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  SLUG: /^[a-z0-9-]+$/,
};

// Form field types
export const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime-local',
  FILE: 'file',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SELECT: 'select',
  TEXTAREA: 'textarea',
} as const;

// Form error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
  PASSWORDS_MUST_MATCH: 'Passwords must match',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  FILE_TOO_LARGE: 'File size must be less than 2MB',
  INVALID_FILE_TYPE: 'Invalid file type',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be less than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be less than ${max}`,
  INVALID_FORMAT: 'Invalid format',
};

// Form validation schemas
export const baseFieldSchema = z.object({
  label: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  className: z.string().optional(),
});

export const textFieldSchema = baseFieldSchema.extend({
  type: z.literal(FIELD_TYPES.TEXT),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
});

export const emailFieldSchema = baseFieldSchema.extend({
  type: z.literal(FIELD_TYPES.EMAIL),
});

export const passwordFieldSchema = baseFieldSchema.extend({
  type: z.literal(FIELD_TYPES.PASSWORD),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  showStrengthIndicator: z.boolean().optional(),
});

export const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal(FIELD_TYPES.NUMBER),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export const fileFieldSchema = baseFieldSchema.extend({
  type: z.literal(FIELD_TYPES.FILE),
  accept: z.string().optional(),
  multiple: z.boolean().optional(),
  maxSize: z.number().optional(),
});

export const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal(FIELD_TYPES.SELECT),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string() || z.number(),
      disabled: z.boolean().optional(),
    })
  ),
});

// Form configuration types
export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];
export type FieldSchema = z.infer<typeof baseFieldSchema>;
export type TextFieldSchema = z.infer<typeof textFieldSchema>;
export type EmailFieldSchema = z.infer<typeof emailFieldSchema>;
export type PasswordFieldSchema = z.infer<typeof passwordFieldSchema>;
export type NumberFieldSchema = z.infer<typeof numberFieldSchema>;
export type FileFieldSchema = z.infer<typeof fileFieldSchema>;
export type SelectFieldSchema = z.infer<typeof selectFieldSchema>;

export type FormConfig = {
  fields: Record<string, FieldSchema>;
  validationSchema?: z.ZodType<any>;
  defaultValues?: Record<string, any>;
  onSubmit?: (data: any) => Promise<void> | void;
};
import { body } from 'express-validator';
import { UserRole, AccountLevel, UserStatus } from '../types';

export const updateUserSchema = [
  body('name')
    .optional()
    .trim()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('mobile')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Must be a valid phone number'),

  body('role')
    .optional()
    .isIn(['user', 'admin', 'moderator'] as UserRole[])
    .withMessage('Invalid role'),

  body('accountLevel')
    .optional()
    .isIn(['basic', 'premium', 'enterprise'] as AccountLevel[])
    .withMessage('Invalid account level'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'] as UserStatus[])
    .withMessage('Invalid status'),

  body('notificationPreferences')
    .optional()
    .isObject()
    .withMessage('Must be an object'),

  body('notificationPreferences.email')
    .optional()
    .isBoolean()
    .withMessage('Must be a boolean'),

  body('notificationPreferences.push')
    .optional()
    .isBoolean()
    .withMessage('Must be a boolean'),

  body('notificationPreferences.sms')
    .optional()
    .isBoolean()
    .withMessage('Must be a boolean'),
];
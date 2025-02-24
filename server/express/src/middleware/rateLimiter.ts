import rateLimit from 'express-rate-limit';
import { createErrorResponse } from '../types/express';

// Base rate limiter for general routes
export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: createErrorResponse(
    'RATE_LIMIT_EXCEEDED',
    'Too many requests, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 5, // limit each IP to 5 attempts per windowMs
  message: createErrorResponse(
    'AUTH_RATE_LIMIT_EXCEEDED',
    'Too many authentication attempts, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for email-related routes
export const emailRateLimiter = rateLimit({
  windowMs: Number(process.env.EMAIL_RATE_LIMIT_WINDOW) || 60 * 60 * 1000, // 1 hour
  max: Number(process.env.EMAIL_RATE_LIMIT_MAX) || 5, // limit each IP to 5 email requests per windowMs
  message: createErrorResponse(
    'EMAIL_RATE_LIMIT_EXCEEDED',
    'Too many email requests, please try again later'
  ),
  standardHeaders: true,
  legacyHeaders: false,
});
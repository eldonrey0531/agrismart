import { SecurityConfig } from '@/types';

/**
 * Security utility functions for frontend protection
 */

// CSP and Security Headers
export const getSecurityHeaders = (): Record<string, string> => ({
  'Content-Security-Policy': getCSP(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});

// Content Security Policy
export const getCSP = (): string => {
  const policies = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", process.env.NEXT_PUBLIC_API_URL || ''],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"]
  };

  return Object.entries(policies)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Token Validation
export const isValidToken = (token: string): boolean => {
  const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return JWT_REGEX.test(token);
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Cookie Security
export const getSecureCookieOptions = (maxAge: number = 7 * 24 * 60 * 60 * 1000) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge
});

// Rate Limiting Helper
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export const checkRateLimit = (
  key: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000
): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (now - record.timestamp > windowMs) {
    record.count = 1;
    record.timestamp = now;
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
};
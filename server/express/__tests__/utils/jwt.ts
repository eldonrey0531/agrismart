import jwt from 'jsonwebtoken';

export interface JwtTestPayload {
  userId: string;
  role: string;
  email: string;
  isVerified: boolean;
  sessionVersion?: number;
  exp?: number;
  iat?: number;
}

const TEST_JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters';
const TEST_JWT_EXPIRATION = '15m';

export function signJwtAccessToken(payload: Partial<JwtTestPayload>): string {
  const tokenPayload: JwtTestPayload = {
    userId: payload.userId || 'test-user-id',
    role: payload.role || 'user',
    email: payload.email || 'test@example.com',
    isVerified: payload.isVerified ?? true,
    sessionVersion: payload.sessionVersion || 1,
  };

  return jwt.sign(
    tokenPayload,
    TEST_JWT_SECRET,
    { expiresIn: TEST_JWT_EXPIRATION }
  );
}

export function verifyJwtToken<T = JwtTestPayload>(token: string): T | null {
  try {
    return jwt.verify(token, TEST_JWT_SECRET) as T;
  } catch (error) {
    return null;
  }
}

export function decodeJwtToken<T = JwtTestPayload>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch (error) {
    return null;
  }
}

export function generateExpiredToken(payload: Partial<JwtTestPayload>): string {
  const tokenPayload: JwtTestPayload = {
    userId: payload.userId || 'test-user-id',
    role: payload.role || 'user',
    email: payload.email || 'test@example.com',
    isVerified: payload.isVerified ?? true,
    sessionVersion: payload.sessionVersion || 1,
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
  };

  return jwt.sign(tokenPayload, TEST_JWT_SECRET);
}

/**
 * Generate refresh token for testing
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      tokenVersion: 1,
      type: 'refresh',
    },
    TEST_JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Generate multiple test tokens
 */
export function generateTestTokens(payload: Partial<JwtTestPayload>) {
  return {
    accessToken: signJwtAccessToken(payload),
    refreshToken: generateRefreshToken(payload.userId || 'test-user-id'),
  };
}

export const jwtUtils = {
  signJwtAccessToken,
  verifyJwtToken,
  decodeJwtToken,
  generateExpiredToken,
  generateRefreshToken,
  generateTestTokens,
  TEST_JWT_SECRET,
  TEST_JWT_EXPIRATION,
};
import bcrypt from 'bcryptjs';
import { VALIDATION } from '@/lib/constants';
import { ApiException } from '@/lib/utils/error-handler';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    throw new ApiException(
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      400
    );
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new ApiException('Error processing password', 500);
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    throw new ApiException('Error verifying password', 500);
  }
}

export function validatePassword(password: string): boolean {
  const minLength = VALIDATION.PASSWORD_MIN_LENGTH;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

export function generateTemporaryPassword(): string {
  const length = VALIDATION.PASSWORD_MIN_LENGTH;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}
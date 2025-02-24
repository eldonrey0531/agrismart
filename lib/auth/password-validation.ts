import { prisma } from '@/lib/prisma';
import { verifyPassword } from './password';
import type { User } from '@prisma/client';
import { MongoClient, ObjectId } from 'mongodb';

export interface PasswordValidationOptions {
  minLength?: number;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSpecialChars?: number;
  maxLength?: number;
  preventReuse?: number;
  minAge?: number;
  preventCommon?: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordStrengthResult {
  score: number;
  strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
  feedback: string[];
}

interface PasswordHistoryEntry {
  _id: ObjectId;
  userId: string;
  password: string;
  createdAt: Date;
}

const DEFAULT_OPTIONS: Required<PasswordValidationOptions> = {
  minLength: 8,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecialChars: 1,
  maxLength: 128,
  preventReuse: 3,
  minAge: 1,
  preventCommon: true,
};

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  'qwerty123',
  'letmein',
]);

// MongoDB connection helper
async function getMongoClient() {
  const client = await MongoClient.connect(process.env.DATABASE_URL!);
  return client;
}

export async function validatePassword(
  password: string,
  userId?: string,
  options: PasswordValidationOptions = {}
): Promise<PasswordValidationResult> {
  const opts: Required<PasswordValidationOptions> = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];

  // Check length
  if (password.length < opts.minLength) {
    errors.push(`Password must be at least ${opts.minLength} characters long`);
  }
  if (password.length > opts.maxLength) {
    errors.push(`Password cannot be longer than ${opts.maxLength} characters`);
  }

  // Check character types
  if (opts.minUppercase > 0) {
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (uppercaseCount < opts.minUppercase) {
      errors.push(`Password must contain at least ${opts.minUppercase} uppercase letter(s)`);
    }
  }

  if (opts.minLowercase > 0) {
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    if (lowercaseCount < opts.minLowercase) {
      errors.push(`Password must contain at least ${opts.minLowercase} lowercase letter(s)`);
    }
  }

  if (opts.minNumbers > 0) {
    const numberCount = (password.match(/[0-9]/g) || []).length;
    if (numberCount < opts.minNumbers) {
      errors.push(`Password must contain at least ${opts.minNumbers} number(s)`);
    }
  }

  if (opts.minSpecialChars > 0) {
    const specialCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
    if (specialCount < opts.minSpecialChars) {
      errors.push(`Password must contain at least ${opts.minSpecialChars} special character(s)`);
    }
  }

  // Check for common passwords
  if (opts.preventCommon && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more secure password');
  }

  // Check password history and age if user ID is provided
  if (userId) {
    try {
      const [user, client] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        getMongoClient()
      ]);

      if (user) {
        const db = client.db();
        const passwordHistory = await db
          .collection<PasswordHistoryEntry>('password_history')
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(opts.preventReuse)
          .toArray();

        // Check password reuse
        const passwordHistoryPromises = passwordHistory.map((entry) =>
          verifyPassword(password, entry.password)
        );

        const historyMatches = await Promise.all(passwordHistoryPromises);
        if (historyMatches.some((match) => match)) {
          errors.push(`Cannot reuse any of your last ${opts.preventReuse} passwords`);
        }

        // Check minimum password age
        if (opts.minAge > 0 && user.lastPasswordReset) {
          const daysSinceLastReset = Math.floor(
            (Date.now() - user.lastPasswordReset.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastReset < opts.minAge) {
            errors.push(`Must wait ${opts.minAge} day(s) between password changes`);
          }
        }

        await client.close();
      }
    } catch (error) {
      console.error('Error checking password history:', error);
      errors.push('Unable to verify password history');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function addToPasswordHistory(userId: string, hashedPassword: string): Promise<void> {
  const client = await getMongoClient();
  
  try {
    const db = client.db();
    const collection = db.collection<PasswordHistoryEntry>('password_history');

    // Add new password to history
    await collection.insertOne({
      _id: new ObjectId(),
      userId,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Get count of password history entries
    const count = await collection.countDocuments({ userId });

    // If we have more than 10 entries, remove the oldest ones
    if (count > 10) {
      const oldestPasswords = await collection
        .find({ userId })
        .sort({ createdAt: 1 })
        .limit(count - 10)
        .toArray();

      if (oldestPasswords.length > 0) {
        await collection.deleteMany({
          _id: { $in: oldestPasswords.map(p => p._id) }
        });
      }
    }
  } catch (error) {
    console.error('Error managing password history:', error);
    throw new Error('Failed to update password history');
  } finally {
    await client.close();
  }
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  // Length contribution (up to 25 points)
  const lengthScore = Math.min(25, Math.floor(password.length * 2));
  score += lengthScore;

  // Character variety (up to 25 points)
  if (password.match(/[A-Z]/)) score += 5;
  if (password.match(/[a-z]/)) score += 5;
  if (password.match(/[0-9]/)) score += 5;
  if (password.match(/[^A-Za-z0-9]/)) score += 10;

  // Length-based bonuses (up to 25 points)
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 15;

  // Pattern penalties
  if (password.match(/(.)\1{2,}/)) {
    score -= 10;
    feedback.push('Avoid repeated characters');
  }

  if (password.match(/^[A-Za-z]+$/)) {
    score -= 10;
    feedback.push('Add numbers or special characters');
  }

  if (password.match(/^[0-9]+$/)) {
    score -= 10;
    feedback.push('Add letters and special characters');
  }

  // Sequence penalties
  if (password.match(/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i)) {
    score -= 10;
    feedback.push('Avoid sequential letters');
  }

  if (password.match(/(?:123|234|345|456|567|678|789|890)/)) {
    score -= 10;
    feedback.push('Avoid sequential numbers');
  }

  // Ensure score stays within 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine strength category
  let strength: PasswordStrengthResult['strength'];
  if (score < 20) strength = 'very-weak';
  else if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'fair';
  else if (score < 80) strength = 'strong';
  else strength = 'very-strong';

  // Add strength-based feedback
  if (score < 60) {
    if (!password.match(/[A-Z]/)) feedback.push('Add uppercase letters');
    if (!password.match(/[a-z]/)) feedback.push('Add lowercase letters');
    if (!password.match(/[0-9]/)) feedback.push('Add numbers');
    if (!password.match(/[^A-Za-z0-9]/)) feedback.push('Add special characters');
    if (password.length < 12) feedback.push('Make the password longer');
  }

  return { score, strength, feedback };
}
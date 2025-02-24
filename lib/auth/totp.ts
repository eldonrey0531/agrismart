import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import { toDataURL } from 'qrcode';

/**
 * Generate TOTP secret and QR code
 */
export async function generateTOTP(userEmail: string) {
  // Generate secret
  const secret = authenticator.generateSecret();

  // Create otpauth URL
  const otpauthUrl = authenticator.keyuri(
    userEmail,
    'AgriSmart',
    secret
  );

  // Generate QR code
  const qrCode = await toDataURL(otpauthUrl);

  return {
    secret,
    qrCode,
  };
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/**
 * Generate recovery codes
 */
export async function generateRecoveryCodes(count: number = 8): Promise<string[]> {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 10 random bytes and convert to hex
    const code = crypto.randomBytes(10).toString('hex')
      // Split into groups of 4 characters
      .match(/.{4}/g)!
      // Join with hyphens
      .join('-')
      // Convert to uppercase
      .toUpperCase();
    
    codes.push(code);
  }

  return codes;
}

/**
 * Hash recovery code for storage
 */
export function hashRecoveryCode(code: string): string {
  return crypto
    .createHash('sha256')
    .update(code.toUpperCase().replace(/-/g, ''))
    .digest('hex');
}

/**
 * Verify recovery code
 */
export function verifyRecoveryCode(
  inputCode: string,
  hashedCodes: string[]
): boolean {
  const hashedInput = hashRecoveryCode(inputCode);
  return hashedCodes.includes(hashedInput);
}

/**
 * Format recovery code for display
 */
export function formatRecoveryCode(code: string): string {
  return code
    .match(/.{4}/g)!
    .join('-')
    .toUpperCase();
}
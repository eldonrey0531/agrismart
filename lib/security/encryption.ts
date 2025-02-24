import crypto from 'crypto';

export class Encryption {
  private static algorithm = 'aes-256-gcm';
  private static keyLength = 32; // 256 bits
  private static ivLength = 12;  // 96 bits for GCM
  private static saltLength = 16;
  private static tagLength = 16;

  static generateKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      100000, // iterations
      this.keyLength,
      'sha256'
    );
  }

  static encrypt(text: string, password: string): string {
    // Generate salt and derive key
    const salt = crypto.randomBytes(this.saltLength);
    const key = this.generateKey(password, salt);

    // Create initialization vector
    const iv = crypto.randomBytes(this.ivLength);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Combine all parts: salt + iv + tag + encrypted
    return Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')])
      .toString('base64');
  }

  static decrypt(encryptedData: string, password: string): string {
    // Convert from base64 and extract parts
    const data = Buffer.from(encryptedData, 'base64');
    
    const salt = data.slice(0, this.saltLength);
    const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
    const tag = data.slice(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = data.slice(this.saltLength + this.ivLength + this.tagLength);

    // Derive key
    const key = this.generateKey(password, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
}

export default Encryption;
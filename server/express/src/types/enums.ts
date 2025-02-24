/**
 * Enum for user roles
 * Must match Prisma schema
 */
export enum Role {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  USER = 'USER'
}

/**
 * Enum for user account status
 * Must match Prisma schema
 */
export enum Status {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

/**
 * Enum for token types
 * Must match Prisma schema
 */
export enum TokenType {
  REFRESH = 'REFRESH',
  VERIFICATION = 'VERIFICATION',
  RESET = 'RESET'
}

/**
 * Type guard for Role enum
 */
export const isRole = (value: unknown): value is Role => {
  return typeof value === 'string' && Object.values(Role).includes(value as Role);
};

/**
 * Type guard for Status enum
 */
export const isStatus = (value: unknown): value is Status => {
  return typeof value === 'string' && Object.values(Status).includes(value as Status);
};

/**
 * Type guard for TokenType enum
 */
export const isTokenType = (value: unknown): value is TokenType => {
  return typeof value === 'string' && Object.values(TokenType).includes(value as TokenType);
};
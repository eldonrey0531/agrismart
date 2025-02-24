import { UserDocument } from './user';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
  let mongod: MongoMemoryServer;
  
  namespace NodeJS {
    interface Global {
      createTestUser(userData?: Partial<UserDocument>): Promise<UserDocument>;
      mongoose: typeof mongoose;
      mongod: MongoMemoryServer;
    }
  }

  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toMatchUserFields(expected: Partial<UserDocument>): R;
      toHaveValidToken(): R;
      toBeValidDate(): R;
    }
  }
}

export interface TestContext {
  mongod: MongoMemoryServer;
  mongoose: typeof mongoose;
  testUser?: UserDocument;
  accessToken?: string;
  refreshToken?: string;
}

// Extend Jest's expect
declare module 'expect' {
  interface AsymmetricMatchers {
    toBeWithinRange(floor: number, ceiling: number): void;
    toMatchUserFields(expected: Partial<UserDocument>): void;
    toHaveValidToken(): void;
    toBeValidDate(): void;
  }
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
    toMatchUserFields(expected: Partial<UserDocument>): R;
    toHaveValidToken(): R;
    toBeValidDate(): R;
  }
}

// Custom test utilities
export interface TestUtils {
  createTestUser(userData?: Partial<UserDocument>): Promise<UserDocument>;
  generateTestToken(userId: string, role?: string): string;
  clearDatabase(): Promise<void>;
  setupTestDatabase(): Promise<void>;
  teardownTestDatabase(): Promise<void>;
}

// Test Request types
export interface TestRequest {
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
  user?: UserDocument;
  accessToken?: string;
}
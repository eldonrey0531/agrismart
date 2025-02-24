/// <reference types="vitest" />

declare module "mongodb-memory-server" {
  export class MongoMemoryServer {
    static create(): Promise<MongoMemoryServer>;
    getUri(): string;
    stop(): Promise<void>;
  }
}

declare module "ioredis" {
  export class Redis {
    constructor(options?: any);
    set(key: string, value: string, mode?: string, duration?: number): Promise<string>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    quit(): Promise<void>;
  }
}

// Extend NodeJS namespace
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRY: string;
    REDIS_URL: string;
    CORS_ORIGIN: string;
  }
}

// Extend Vitest's expect
interface CustomMatchers<R = unknown> {
  toBeValidObjectId(): R;
  toHaveSuccessStatus(): R;
  toHaveErrorStatus(): R;
  toBeValidJWT(): R;
  toMatchSchema(schema: any): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Test utility types
declare namespace TestUtils {
  interface MockUser {
    _id?: string;
    name: string;
    email: string;
    role: string;
    status: string;
  }

  interface MockProduct {
    _id?: string;
    title: string;
    description: string;
    price: number;
    category: string;
    sellerId: string;
  }

  interface MockOrder {
    _id?: string;
    buyerId: string;
    productId: string;
    quantity: number;
    status: string;
  }

  interface MockRequest {
    body: Record<string, any>;
    query: Record<string, any>;
    params: Record<string, any>;
    headers: Record<string, any>;
    user?: MockUser;
  }

  interface MockResponse {
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
  }
}

// Custom error types for testing
declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
  
  class AppError extends Error {
    status: number;
    code: string;
    constructor(message: string, status: number, code?: string);
  }

  class ValidationError extends AppError {
    errors: Record<string, string>;
    constructor(message: string, errors: Record<string, string>);
  }

  class NotFoundError extends AppError {
    constructor(message: string);
  }

  class AuthenticationError extends AppError {
    constructor(message: string);
  }

  class AuthorizationError extends AppError {
    constructor(message: string);
  }
}
import type { Response } from 'supertest';
import type { User } from './models';
import type { ApiResponse, ApiTypes } from './api';

/**
 * Extended test user with authentication tokens
 */
export interface TestUser extends Omit<User, 'password'> {
  accessToken: string;
  rawPassword: string;
}

/**
 * API endpoints response types
 */
export type EndpointTypes = {
  auth: ApiTypes['auth'];
  chat: ApiTypes['chat'];
};

/**
 * Test response with proper typing
 */
export interface TestResponse<
  T extends keyof EndpointTypes = never,
  K extends keyof EndpointTypes[T] = never
> extends Omit<Response, 'body'> {
  body: ApiResponse<
    T extends keyof EndpointTypes
      ? K extends keyof EndpointTypes[T]
        ? EndpointTypes[T][K]['response']
        : never
      : unknown
  >;
}

/**
 * Test assertion utilities
 */
export interface TestAssertions {
  /**
   * Assert successful response
   */
  success<T>(response: TestResponse<any, any>, status?: number): T;

  /**
   * Assert error response
   */
  error(response: TestResponse<any, any>, status: number, errorType?: string): void;
}

/**
 * Test data creation utilities
 */
export interface TestFactory {
  /**
   * Create test user
   */
  createUser(data?: Partial<{
    email: string;
    password: string;
    role: User['role'];
  }>): Promise<TestUser>;

  /**
   * Create test admin
   */
  createAdmin(data?: Partial<{
    email: string;
    password: string;
  }>): Promise<TestUser>;

  /**
   * Create test conversation
   */
  createConversation(data: {
    name?: string;
    participants: string[];
  }): Promise<EndpointTypes['chat']['conversation']['create']['response']>;
}

/**
 * Generic test utility type
 */
export type TestUtils = TestAssertions & TestFactory;

// Make this a module
export {};
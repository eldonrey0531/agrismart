import { TestResponse } from '../types/test';
import { UserRole } from '../types/models';
import { generateToken } from '../utils/jwt';
import { isSuccessResponse, isErrorResponse } from '../types/api';
import type { ApiSuccessResponse } from '../types/api';
import supertest from 'supertest';
import { app } from '../app';

/**
 * Test agent type
 */
export type TestAgent = ReturnType<typeof supertest>;

/**
 * Create a test agent
 */
export function createTestAgent() {
  return supertest(app);
}

/**
 * Test user data
 */
export interface TestUserData {
  id: string;
  email: string;
  role: UserRole;
  password?: string;
}

/**
 * Create test user data
 */
export function createTestUser(override?: Partial<TestUserData>): TestUserData {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: UserRole.USER,
    password: 'password123',
    ...override,
  };
}

/**
 * Create test admin data
 */
export function createTestAdmin(override?: Partial<TestUserData>): TestUserData {
  return {
    id: 'test-admin-id',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    password: 'admin123',
    ...override,
  };
}

/**
 * Create auth token for test user
 */
export function createTestToken(user: TestUserData): string {
  return generateToken({
    id: user.id,
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  });
}

/**
 * Create auth header with token
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create test users and their tokens
 */
export function createTestUsers() {
  const regularUser = createTestUser();
  const adminUser = createTestAdmin();

  return {
    regularUser,
    adminUser,
    regularToken: createTestToken(regularUser),
    adminToken: createTestToken(adminUser),
  };
}

/**
 * Response assertions with proper types
 */
export function assertSuccessResponse<T>(response: TestResponse): T {
  expect(response).toBeValidResponse();
  expect(response.status).toBeLessThan(400);
  
  if (!isSuccessResponse(response.body)) {
    throw new Error('Expected success response but got error response');
  }

  const successResponse = response.body as ApiSuccessResponse<T>;
  return successResponse.data;
}

/**
 * Type guard for success responses
 */
export function isSuccessResponseWithData<T>(
  response: TestResponse
): response is TestResponse & { body: ApiSuccessResponse<T> } {
  return isSuccessResponse(response.body) && 'data' in response.body;
}

/**
 * Error response assertions
 */
export function assertErrorResponse(
  response: TestResponse,
  status: number,
  errorType: string
): void {
  expect(response).toBeValidResponse();
  expect(response.status).toBe(status);
  expect(response).toHaveErrorType(errorType);
}

export function assertUnauthorized(response: TestResponse): void {
  assertErrorResponse(response, 401, 'AUTHENTICATION_ERROR');
}

export function assertForbidden(response: TestResponse): void {
  assertErrorResponse(response, 403, 'AUTHORIZATION_ERROR');
}

export function assertNotFound(response: TestResponse): void {
  assertErrorResponse(response, 404, 'NOT_FOUND');
}

export function assertValidationError(response: TestResponse): void {
  assertErrorResponse(response, 400, 'VALIDATION_ERROR');
}

// Re-export types for convenience
export type { TestResponse };
export { isSuccessResponse, isErrorResponse };
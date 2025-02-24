import type { UserRole } from './models';
import type { Response, SuperTest, Test } from 'supertest';
import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from './api';

/**
 * Test response type combining supertest Response and our API response
 */
export interface TestResponse extends Omit<Response, 'body'> {
  body: ApiResponse;
  status: number;
  headers: Record<string, string>;
  type: string;
  charset?: string;
}

/**
 * Test user type
 */
export interface TestUser {
  id: string;
  email: string;
  role: UserRole;
  password?: string;
}

/**
 * Test data with timestamps
 */
export interface TestDataBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mock request headers type
 */
export type TestHeaders = Record<string, string>;

/**
 * Test agent type
 */
export type TestAgent = SuperTest<Test>;

/**
 * Test request type
 */
export type TestRequest = Test;

/**
 * Test pagination parameters
 */
export interface TestPaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Test sort parameters
 */
export interface TestSortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Test query parameters combining pagination and sort
 */
export interface TestQueryParams extends TestPaginationParams, TestSortParams {
  search?: string;
  filter?: string;
}

/**
 * Type guard for success response
 */
export function isTestSuccessResponse<T>(response: TestResponse): response is TestResponse & { body: ApiSuccessResponse<T> } {
  return response.body.success === true;
}

/**
 * Type guard for error response
 */
export function isTestErrorResponse(response: TestResponse): response is TestResponse & { body: ApiErrorResponse } {
  return response.body.success === false;
}

// Re-export types from api.ts for convenience
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse };

// Re-export supertest types for convenience
export type { Response as SuperTestResponse, Test as SuperTestRequest };
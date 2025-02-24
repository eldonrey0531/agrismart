import type { Application } from 'express';
import supertest, { SuperTest, Test } from 'supertest';
import { app } from '../app';
import type { TestResponse, TestUser, TestHeaders } from '../types/test';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types/models';

export type TestAgent = SuperTest<Test>;
export type TestRequest = Test;

/**
 * Create a test agent
 */
export const createTestAgent = (server: Application = app): TestAgent => {
  return supertest(server);
};

/**
 * Create an authenticated request
 */
export const createAuthRequest = (
  server: Application = app,
  token: string
): TestAgent => {
  const agent = createTestAgent(server);
  // We need to apply the token to each request
  const originalGet = agent.get.bind(agent);
  const originalPost = agent.post.bind(agent);
  const originalPut = agent.put.bind(agent);
  const originalDelete = agent.delete.bind(agent);

  agent.get = (url: string) => originalGet(url).set('Authorization', `Bearer ${token}`);
  agent.post = (url: string) => originalPost(url).set('Authorization', `Bearer ${token}`);
  agent.put = (url: string) => originalPut(url).set('Authorization', `Bearer ${token}`);
  agent.delete = (url: string) => originalDelete(url).set('Authorization', `Bearer ${token}`);

  return agent;
};

/**
 * Create a test token for a user
 */
export const createTestToken = (user: TestUser): string => {
  return generateToken({
    id: user.id,
    sub: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  });
};

/**
 * Create an authenticated test request with user
 */
export const createAuthTestRequest = (
  server: Application = app,
  user: TestUser
): TestAgent => {
  const token = createTestToken(user);
  return createAuthRequest(server, token);
};

/**
 * Make an authenticated request
 */
export const makeAuthRequest = async (
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  token?: string,
  data?: unknown
): Promise<TestRequest> => {
  const agent = createTestAgent();
  const request = agent[method](url);

  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }

  if (data) {
    request.send(data);
  }

  return request;
};

/**
 * Create test users with tokens
 */
export const createTestUsers = () => {
  const regularUser: TestUser = {
    id: 'test-user-id',
    email: 'user@test.com',
    role: UserRole.USER,
  };

  const adminUser: TestUser = {
    id: 'test-admin-id',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  return {
    regularUser,
    adminUser,
    regularToken: createTestToken(regularUser),
    adminToken: createTestToken(adminUser),
  };
};

/**
 * Create test headers
 */
export const createTestHeaders = (token?: string): TestHeaders => {
  const headers: TestHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Test environment setup and teardown
 */
export const setupTestEnv = {
  beforeAll: async () => {
    // Add initialization logic here
    await Promise.resolve();
  },
  afterAll: async () => {
    // Add cleanup logic here
    await Promise.resolve();
  },
  beforeEach: async () => {
    // Add per-test setup logic here
    await Promise.resolve();
    jest.resetModules();
    jest.clearAllMocks();
  },
};

// Re-export for convenience
export type { TestResponse, TestUser, TestHeaders };
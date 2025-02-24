import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createServer } from '../server';
import { hashPassword } from '../utils/auth';
import { sign } from 'jsonwebtoken';
import type { TestResponse } from '../types/test';
import type { User, UserRole } from '../types/prisma-temp';

// Initialize test server
const app = createServer();
const request = supertest(app);

/**
 * Create a test user with authentication tokens
 */
export async function createTestUser(prisma: PrismaClient, data: {
  email?: string;
  password?: string;
  role?: UserRole;
} = {}) {
  const email = data.email || `test-${Date.now()}@example.com`;
  const password = data.password || 'password123';
  const role = data.role || 'USER';

  // Create user in database
  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      role,
    },
  });

  // Generate tokens
  const accessToken = sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '15m' }
  );

  return {
    user,
    accessToken,
    password,
  };
}

/**
 * Create a test admin user
 */
export async function createTestAdmin(prisma: PrismaClient, data: {
  email?: string;
  password?: string;
} = {}) {
  return createTestUser(prisma, {
    ...data,
    role: 'ADMIN',
  });
}

/**
 * Make an authenticated request
 */
export function authRequest(token?: string) {
  return {
    get(url: string) {
      const req = request.get(url);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req as unknown as Promise<TestResponse>;
    },
    post(url: string, data?: any) {
      const req = request.post(url).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req as unknown as Promise<TestResponse>;
    },
    put(url: string, data?: any) {
      const req = request.put(url).send(data);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req as unknown as Promise<TestResponse>;
    },
    delete(url: string) {
      const req = request.delete(url);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req as unknown as Promise<TestResponse>;
    },
  };
}

/**
 * Create test data fixtures
 */
export async function createTestData(prisma: PrismaClient) {
  // Create test users
  const [regularUser, adminUser] = await Promise.all([
    createTestUser(prisma),
    createTestAdmin(prisma),
  ]);

  // Create test conversation
  const conversation = await prisma.conversation.create({
    data: {
      name: 'Test Conversation',
      participants: {
        create: [
          { userId: regularUser.user.id },
          { userId: adminUser.user.id },
        ],
      },
    },
  });

  // Create test messages
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hello from regular user!',
        senderId: regularUser.user.id,
        conversationId: conversation.id,
      },
    }),
    prisma.message.create({
      data: {
        content: 'Hello from admin!',
        senderId: adminUser.user.id,
        conversationId: conversation.id,
      },
    }),
  ]);

  return {
    users: {
      regular: regularUser,
      admin: adminUser,
    },
    conversation,
    messages,
  };
}

// Re-export request for direct use
export { request };
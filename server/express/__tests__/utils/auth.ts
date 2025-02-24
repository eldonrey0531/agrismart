import { prisma } from '../../utils/prisma';
import { sign } from 'jsonwebtoken';
import { Role } from '../../models/types/Role';
import { hash } from 'bcrypt';
import { Prisma, User } from '@prisma/client';

interface CreateUserOptions {
  role?: Role;
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  email?: string;
  name?: string;
}

interface TestUser extends Omit<User, 'password'> {
  token: string;
}

export async function createTestUser(options: CreateUserOptions = {}): Promise<TestUser> {
  const {
    role = Role.USER,
    status = 'ACTIVE',
    email = `test${Date.now()}@example.com`,
    name = 'Test User'
  } = options;

  const password = await hash('password123', 10);

  const userData: Prisma.UserCreateInput = {
    email,
    name,
    password,
    role,
    status,
    emailVerified: new Date()
  };

  const user = await prisma.user.create({
    data: userData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      emailVerified: true
    }
  });

  const token = sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  return { ...user, token };
}

export async function clearTestData(): Promise<void> {
  // First delete products to avoid foreign key constraints
  await prisma.$executeRaw`
    DELETE FROM "Product" 
    WHERE "sellerId" IN (
      SELECT id FROM "User" WHERE email LIKE 'test%'
    )
  `;

  // Then delete test users
  await prisma.$executeRaw`
    DELETE FROM "User" WHERE email LIKE 'test%'
  `;
}

export function createAuthHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

// Test data generators
export function generateTestProductData(categoryId: string) {
  return {
    name: `Test Product ${Date.now()}`,
    description: 'Test product description',
    price: 99.99,
    categoryId,
    condition: 'new' as const,
    images: []
  };
}

export function generateTestCategoryData() {
  return {
    name: `Test Category ${Date.now()}`,
    description: 'Test category description',
    level: 0,
    order: 0
  };
}
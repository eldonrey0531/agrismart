import type { PrismaClient, User, Prisma } from '@prisma/client';

/**
 * Prisma mock result types
 */
type PrismaMockResult<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => Promise<infer R>
    ? jest.Mock<Promise<R>, Parameters<T[K]>>
    : T[K] extends object
    ? PrismaMockResult<T[K]>
    : T[K];
};

/**
 * Create Prisma mock
 */
export function createPrismaMock(): jest.Mocked<PrismaClient> {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    role: 'USER' as const,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  } satisfies User;

  return {
    user: {
      findUnique: jest.fn().mockResolvedValue(mockUser),
      findFirst: jest.fn().mockResolvedValue(mockUser),
      findMany: jest.fn().mockResolvedValue([mockUser]),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue(mockUser),
      upsert: jest.fn().mockResolvedValue(mockUser),
      count: jest.fn().mockResolvedValue(1),
      messages: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      conversations: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn().mockImplementation((args) => args()),
    $use: jest.fn(),
    $on: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>;
}

/**
 * Reset all Prisma mocks
 */
export function resetPrismaMocks(prisma: jest.Mocked<PrismaClient>): void {
  // Reset client methods
  Object.values(prisma).forEach((value) => {
    if (jest.isMockFunction(value)) {
      value.mockReset();
    }
  });

  // Reset model methods
  Object.values(prisma.user).forEach((value) => {
    if (jest.isMockFunction(value)) {
      value.mockReset();
    }
  });
}

/**
 * Mock specific Prisma method
 */
export function mockPrismaMethod<
  Model extends keyof PrismaClient,
  Method extends keyof PrismaClient[Model],
  Result
>(
  prisma: jest.Mocked<PrismaClient>,
  model: Model,
  method: Method,
  result: Result | Error
): void {
  const mockFn = prisma[model][method] as jest.Mock;
  
  if (result instanceof Error) {
    mockFn.mockRejectedValueOnce(result);
  } else {
    mockFn.mockResolvedValueOnce(result);
  }
}

export const prismaMock = createPrismaMock();

export default {
  createPrismaMock,
  resetPrismaMocks,
  mockPrismaMethod,
  prismaMock,
};
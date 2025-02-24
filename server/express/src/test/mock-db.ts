import type { Prisma, PrismaClient, User } from '@prisma/client';
import { testUtils } from './utils';

/**
 * Mock database interface
 */
interface MockDb {
  user: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findFirst: jest.Mock;
  };
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $transaction: jest.Mock;
}

/**
 * Create mock database
 */
export function createMockDb(): jest.Mocked<PrismaClient> {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>;
}

/**
 * Database mock data setup
 */
export function setupMockData(mockDb: MockDb) {
  const users = {
    basic: testUtils.testData.user.basic,
    admin: testUtils.testData.user.admin,
  };

  return {
    /**
     * Setup user mocks
     */
    users: {
      /**
       * Mock findUnique by email
       */
      mockFindByEmail: (email: string, user: Partial<User> | null = null) => {
        mockDb.user.findUnique.mockImplementation(async (args: any) => {
          if (args.where?.email === email) {
            return user;
          }
          return null;
        });
      },

      /**
       * Mock findUnique by id
       */
      mockFindById: (id: string, user: Partial<User> | null = null) => {
        mockDb.user.findUnique.mockImplementation(async (args: any) => {
          if (args.where?.id === id) {
            return user;
          }
          return null;
        });
      },

      /**
       * Mock create user
       */
      mockCreate: (data: Prisma.UserCreateInput, user: Partial<User>) => {
        mockDb.user.create.mockImplementation(async (args: any) => {
          if (args.data.email === data.email) {
            return { ...users.basic, ...user };
          }
          return null;
        });
      },

      /**
       * Mock update user
       */
      mockUpdate: (id: string, data: Prisma.UserUpdateInput, user: Partial<User>) => {
        mockDb.user.update.mockImplementation(async (args: any) => {
          if (args.where?.id === id) {
            return { ...users.basic, ...user };
          }
          return null;
        });
      },

      /**
       * Mock delete user
       */
      mockDelete: (id: string, user: Partial<User> | null = null) => {
        mockDb.user.delete.mockImplementation(async (args: any) => {
          if (args.where?.id === id) {
            return user;
          }
          throw new Error('User not found');
        });
      },

      /**
       * Mock find many users
       */
      mockFindMany: (filter: Partial<User>, results: Partial<User>[]) => {
        mockDb.user.findMany.mockImplementation(async (args: any) => {
          if (args.where) {
            return results.filter(user => 
              Object.entries(filter).every(([key, value]) => 
                user[key as keyof User] === value
              )
            );
          }
          return results;
        });
      },
    },

    /**
     * Reset all mocks
     */
    reset: () => {
      Object.values(mockDb.user).forEach(mock => mock.mockReset());
      mockDb.$connect.mockReset();
      mockDb.$disconnect.mockReset();
      mockDb.$transaction.mockReset();
    },

    /**
     * Mock database error
     */
    mockError: (method: keyof typeof mockDb.user, error: Error) => {
      mockDb.user[method].mockRejectedValueOnce(error);
    },
  };
}

/**
 * Database test utilities
 */
export const dbTestUtils = {
  createMockDb,
  setupMockData,
};

export type { MockDb };
export default dbTestUtils;
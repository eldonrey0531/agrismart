import { PrismaClient } from '@prisma/client';
import { UserRole } from '../types/models';
import { hashPassword } from '../utils/auth';

// Initialize Prisma client with test environment settings
export const prisma = new PrismaClient({
  log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

/**
 * Test database helpers
 */
export const db = {
  /**
   * Create a test user
   */
  async createUser(data: {
    email?: string;
    password?: string;
    role?: UserRole;
  } = {}) {
    const password = await hashPassword(data.password || 'password123');
    return prisma.user.create({
      data: {
        email: data.email || 'test@example.com',
        password,
        role: data.role || UserRole.USER,
      },
    });
  },

  /**
   * Create a test admin
   */
  async createAdmin(data: {
    email?: string;
    password?: string;
  } = {}) {
    return this.createUser({
      ...data,
      role: UserRole.ADMIN,
      email: data.email || 'admin@example.com',
      password: data.password || 'admin123',
    });
  },

  /**
   * Create a test conversation
   */
  async createConversation(participants: string[]) {
    return prisma.conversation.create({
      data: {
        participants: {
          create: participants.map(userId => ({
            userId,
          })),
        },
      },
      include: {
        participants: true,
      },
    });
  },

  /**
   * Create a test message
   */
  async createMessage(data: {
    content: string;
    senderId: string;
    conversationId: string;
  }) {
    return prisma.message.create({
      data: {
        content: data.content,
        senderId: data.senderId,
        conversationId: data.conversationId,
      },
    });
  },

  /**
   * Clear all test data
   */
  async clearDatabase() {
    const tables = [
      'messages',
      'conversation_participants',
      'conversations',
      'users',
    ];

    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  },

  /**
   * Create test data set
   */
  async createTestData() {
    const [user1, user2, adminUser] = await Promise.all([
      this.createUser(),
      this.createUser({ email: 'user2@example.com' }),
      this.createAdmin(),
    ]);

    const conversation = await this.createConversation([user1.id, user2.id]);

    await Promise.all([
      this.createMessage({
        content: 'Hello from user 1!',
        senderId: user1.id,
        conversationId: conversation.id,
      }),
      this.createMessage({
        content: 'Hi user 1, from user 2!',
        senderId: user2.id,
        conversationId: conversation.id,
      }),
    ]);

    return {
      users: { user1, user2, adminUser },
      conversation,
    };
  },
};

/**
 * Connect to test database
 */
export async function connectTestDb() {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDb() {
  await prisma.$disconnect();
}

/**
 * Reset test database
 */
export async function resetTestDb() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  try {
    await db.clearDatabase();
  } catch (error) {
    console.error('Error resetting test database:', error);
    throw error;
  }
}

// Export types
export type { PrismaClient };
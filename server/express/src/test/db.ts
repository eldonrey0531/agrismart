import { PrismaClient } from '@prisma/client';

/**
 * Initialize test database client
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chat_app_test',
    },
  },
  log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Clear test database
 */
export async function clearDatabase() {
  const tables = ['messages', 'conversation_participants', 'conversations', 'users'];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

/**
 * Handle database lifecycle
 */
export async function setupTestDatabase() {
  await prisma.$connect();

  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.COOKIE_SECRET = 'test-cookie-secret';
}

export async function teardownTestDatabase() {
  await clearDatabase();
  await prisma.$disconnect();
}

// Global setup hooks
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

// Proper shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
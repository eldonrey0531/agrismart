import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.$transaction([
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('🗑️  Cleaned up existing data');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  const [user1, user2, adminUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        password: hashedPassword,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        password: hashedPassword,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedAdminPassword,
        role: UserRole.ADMIN,
      },
    }),
  ]);

  console.log('👥 Created test users');

  // Create test conversation
  const conversation = await prisma.conversation.create({
    data: {
      name: 'Test Conversation',
      participants: {
        create: [
          { userId: user1.id },
          { userId: user2.id },
        ],
      },
      messages: {
        create: [
          {
            content: 'Hello from user 1!',
            senderId: user1.id,
          },
          {
            content: 'Hi user 1, from user 2!',
            senderId: user2.id,
          },
        ],
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  });

  console.log('💬 Created test conversation');

  // Log summary
  console.log('\n✅ Seed data created:');
  console.log('Users:', {
    user1: { id: user1.id, email: user1.email },
    user2: { id: user2.id, email: user2.email },
    admin: { id: adminUser.id, email: adminUser.email },
  });
  console.log('Conversation:', {
    id: conversation.id,
    name: conversation.name,
    messageCount: conversation.messages.length,
    participantCount: conversation.participants.length,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
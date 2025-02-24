import { Message, Chat } from '@/types';
import { prisma } from '@/config/db.config';

export class ChatModel {
  static async createChat(): Promise<Chat> {
    return prisma.chat.create({ data: {} });
  }

  static async addMessage(data: Omit<Message, 'id'>): Promise<Message> {
    return prisma.message.create({ data });
  }

  static async getMessages(chatId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }
    });
  }
}

import { ChatModel } from '../models/chat.model';
import { Message, Chat } from '@/types';

export class ChatService {
  static async createChat(): Promise<Chat> {
    return ChatModel.createChat();
  }

  static async sendMessage(data: Omit<Message, 'id'>): Promise<Message> {
    return ChatModel.addMessage(data);
  }

  static async getChatMessages(chatId: string): Promise<Message[]> {
    return ChatModel.getMessages(chatId);
  }
}

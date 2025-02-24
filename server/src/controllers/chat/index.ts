import type { IMessage, IConversation, MessageStatus, IParticipant } from "@/types/chat";
import { createMessage, updateMessageStatus } from "@/server/models/message";
import { 
  findConversation, 
  updateLastMessage, 
  createConversation,
  ConversationModel
} from "@/server/models/conversation";

export class ChatController {
  static async sendMessage(
    userId: string,
    conversationId: string,
    content: string
  ): Promise<IMessage | null> {
    try {
      // Create message
      const message = await createMessage(conversationId, userId, content);

      // Update conversation's last message
      await updateLastMessage(conversationId, content, userId);

      return message;
    } catch (error) {
      console.error("[CHAT_CONTROLLER_ERROR]", error);
      return null;
    }
  }

  static async startConversation(
    userId: string,
    participantId: string,
    initialMessage: string
  ): Promise<IConversation | null> {
    try {
      // Check if conversation already exists
      const existingConversation = await this.findConversationBetweenUsers(userId, participantId);
      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const conversation = await createConversation(
        [
          { id: userId, name: "User" }, // TODO: Get actual user names
          { id: participantId, name: "Participant" }
        ],
        {
          content: initialMessage,
          senderId: userId,
        }
      );

      return conversation;
    } catch (error) {
      console.error("[CHAT_CONTROLLER_ERROR]", error);
      return null;
    }
  }

  static async updateStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<boolean> {
    try {
      const message = await updateMessageStatus(messageId, status);
      return !!message;
    } catch (error) {
      console.error("[CHAT_CONTROLLER_ERROR]", error);
      return false;
    }
  }

  static async validateConversationAccess(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const conversation = await findConversation(conversationId);
      if (!conversation) {
        return false;
      }

      return conversation.participants.some((p: IParticipant) => p.id === userId);
    } catch (error) {
      console.error("[CHAT_CONTROLLER_ERROR]", error);
      return false;
    }
  }

  static async findConversationBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<IConversation | null> {
    try {
      const conversation = await ConversationModel.findOne({
        $and: [
          { 'participants.id': userId1 },
          { 'participants.id': userId2 }
        ]
      });

      return conversation;
    } catch (error) {
      console.error("[CHAT_CONTROLLER_ERROR]", error);
      return null;
    }
  }

  static async getUserConversations(userId: string): Promise<IConversation[]> {
    try {
      const conversations = await ConversationModel
        .find({ 'participants.id': userId })
        .sort({ updatedAt: -1 });

      return conversations;
    } catch (error) {
      console.error("[CHAT_CONTROLLER_ERROR]", error);
      return [];
    }
  }
}
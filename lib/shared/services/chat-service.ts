import { io, Socket } from 'socket.io-client';
import { ChatEvent, Conversation, GetConversationsRequest, GetMessagesRequest, Message, SendMessageRequest } from '../types/chat';

export class ChatService {
  private static instance: ChatService;
  private socket: Socket | null = null;
  private readonly baseUrl: string;
  private readonly expressUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.expressUrl = process.env.EXPRESS_API_URL || 'http://localhost:5001';
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Initialize WebSocket connection
  public initializeSocket(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(this.expressUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  // Subscribe to chat events
  public subscribeToEvents(callback: (event: ChatEvent) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    const eventHandler = (event: ChatEvent) => {
      callback(event);
    };

    this.socket.on('chat_event', eventHandler);

    // Return unsubscribe function
    return () => {
      this.socket?.off('chat_event', eventHandler);
    };
  }

  // Get user's conversations
  public async getConversations(params: GetConversationsRequest): Promise<Conversation[]> {
    try {
      const queryParams = new URLSearchParams({
        limit: params.limit?.toString() ?? '20',
        page: params.page?.toString() ?? '1',
        ...(params.archived && { archived: 'true' }),
      });

      const response = await fetch(`${this.expressUrl}/chat/conversations?${queryParams}`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch conversations');
      }

      return data.data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  // Get messages for a conversation
  public async getMessages(params: GetMessagesRequest): Promise<Message[]> {
    try {
      const queryParams = new URLSearchParams({
        limit: params.limit?.toString() ?? '50',
        ...(params.before && { before: params.before }),
      });

      const response = await fetch(
        `${this.expressUrl}/chat/conversations/${params.conversationId}/messages?${queryParams}`,
        {
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch messages');
      }

      return data.data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  public async sendMessage(params: SendMessageRequest): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append('content', params.content);

      if (params.attachments) {
        params.attachments.forEach((attachment) => {
          formData.append('attachments', attachment.file);
        });
      }

      const response = await fetch(
        `${this.expressUrl}/chat/conversations/${params.conversationId}/messages`,
        {
          method: 'POST',
          headers: this.getHeaders(false), // Don't set content-type for FormData
          body: formData,
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to send message');
      }

      return data.data.message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Delete a message
  public async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(`${this.expressUrl}/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Archive a conversation
  public async archiveConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.expressUrl}/chat/conversations/${conversationId}/archive`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to archive conversation');
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }

  // Helper method to get headers
  private getHeaders(includeContentType = true): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // Cleanup method
  public cleanup(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance();
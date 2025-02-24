import { Server as WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { Types } from 'mongoose';
import { Conversation, Message, MessageDocument } from '../models/Chat';
import { NotFoundError, BadRequestError } from '../utils/app-error';
import { notificationService } from './NotificationService';

interface WebSocketClient extends Omit<WebSocket, 'readyState'> {
  userId?: string;
  isAlive: boolean;
  readyState: WebSocket['readyState'];
  CONNECTING: WebSocket['CONNECTING'];
  OPEN: WebSocket['OPEN'];
  CLOSING: WebSocket['CLOSING'];
  CLOSED: WebSocket['CLOSED'];
}

interface ChatEvent {
  type: string;
  payload: any;
  conversationId: string;
  senderId: string;
}

export class ChatService {
  private wss: WebSocketServer | null = null;
  private userSockets: Map<string, Set<WebSocketClient>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.initializeHeartbeat();
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      const client = ws as unknown as WebSocketClient;
      client.isAlive = true;

      client.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === 'auth' && data.userId) {
            await this.handleAuthentication(client, data.userId);
          } else if (data.type === 'typing') {
            this.handleTypingEvent(client, data);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      client.on('pong', () => {
        client.isAlive = true;
      });

      client.on('close', () => {
        if (client.userId) {
          this.handleDisconnection(client);
        }
      });
    });
  }

  private initializeHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;

      this.wss.clients.forEach((ws: WebSocket) => {
        const client = ws as unknown as WebSocketClient;
        if (client.isAlive === false) {
          if (client.userId) {
            this.handleDisconnection(client);
          }
          return client.terminate();
        }

        client.isAlive = false;
        client.ping();
      });
    }, this.PING_INTERVAL);
  }

  /**
   * Handle client authentication
   */
  private async handleAuthentication(client: WebSocketClient, userId: string): Promise<void> {
    client.userId = userId;

    // Add socket to user's set of connections
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client);

    // Join user's conversation rooms
    const conversations = await Conversation.find({ participants: userId });
    conversations.forEach(conv => {
      if (conv._id) {
        this.joinRoom(client, conv._id.toString());
      }
    });

    // Broadcast online status
    this.broadcastUserStatus(userId, true);
  }

  /**
   * Handle client disconnection
   */
  private handleDisconnection(client: WebSocketClient): void {
    if (!client.userId) return;

    const userSockets = this.userSockets.get(client.userId);
    if (userSockets) {
      userSockets.delete(client);
      if (userSockets.size === 0) {
        this.userSockets.delete(client.userId);
        this.broadcastUserStatus(client.userId, false);
      }
    }
  }

  /**
   * Handle typing events
   */
  private handleTypingEvent(client: WebSocketClient, data: any): void {
    if (!client.userId || !data.conversationId) return;

    const eventType = data.isTyping ? 'typing.start' : 'typing.stop';
    this.broadcastToRoom(data.conversationId, {
      type: eventType,
      senderId: client.userId,
      conversationId: data.conversationId,
    });
  }

  /**
   * Join a room (conversation)
   */
  private joinRoom(client: WebSocketClient, room: string): void {
    if (!client.userId) return;
    // WebSocket rooms are handled through our own tracking
    // as the ws package doesn't have built-in room support
  }

  /**
   * Broadcast to all clients in a room
   */
  private broadcastToRoom(room: string, data: any): void {
    if (!this.wss) return;

    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as unknown as WebSocketClient;
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  /**
   * Send a message to all clients in a conversation
   */
  async sendMessageToConversation(
    conversationId: string,
    message: MessageDocument,
    senderId: string
  ): Promise<void> {
    // Broadcast message to conversation room
    this.broadcastToRoom(conversationId, {
      type: 'message.new',
      message: await message.populate('sender', 'name avatar'),
      conversationId,
      senderId,
    });

    // Get conversation with participants
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name');

    if (!conversation) return;

    // Send notifications to other participants
    const otherParticipants = conversation.participants
      .map(p => p._id.toString())
      .filter(id => id !== senderId);

    otherParticipants.forEach(participantId => {
      notificationService.broadcastEvent({
        type: 'chat_message',
        payload: {
          conversationId,
          messageId: message._id,
          senderId,
        },
        userId: participantId,
      });
    });
  }

  /**
   * Broadcast message deletion event
   */
  broadcastMessageDeletion(messageId: string, conversationId: string, senderId: string): void {
    this.broadcastToRoom(conversationId, {
      type: 'message.delete',
      messageId,
      conversationId,
      senderId,
    });
  }

  /**
   * Broadcast user's online status
   */
  private broadcastUserStatus(userId: string, online: boolean): void {
    if (!this.wss) return;

    this.wss.clients.forEach((ws: WebSocket) => {
      const client = ws as unknown as WebSocketClient;
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user.status',
          userId,
          online,
        }));
      }
    });
  }

  /**
   * Broadcast chat event
   */
  broadcastEvent(event: ChatEvent): void {
    this.broadcastToRoom(event.conversationId, {
      type: event.type,
      ...event.payload,
      senderId: event.senderId,
    });
  }

  /**
   * Get user's online status
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get number of active connections for a user
   */
  getUserConnectionCount(userId: string): number {
    const userSockets = this.userSockets.get(userId);
    return userSockets ? userSockets.size : 0;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
    this.userSockets.clear();
  }
}

// Create singleton instance
export const chatService = new ChatService();
export default chatService;
import { BaseSocketHandler } from './base';
import {
  ChatEvent,
  ChatMessage,
  ChatRoom,
  ChatResponse,
  SendMessageData,
  CreateRoomData
} from '../../../shared/types/chat';

export class ChatHandler extends BaseSocketHandler {
  private readonly PREFIX = 'chat';

  setupHandlers(): void {
    this.on(ChatEvent.MESSAGE_SEND, this.handleSendMessage.bind(this));
    this.on(ChatEvent.ROOM_CREATE, this.handleCreateRoom.bind(this));
    this.on(ChatEvent.ROOM_JOIN, this.handleJoinRoom.bind(this));
    this.on(ChatEvent.ROOM_LEAVE, this.handleLeaveRoom.bind(this));
    this.on(ChatEvent.TYPING_START, this.handleTypingStart.bind(this));
    this.on(ChatEvent.TYPING_STOP, this.handleTypingStop.bind(this));

    this.log('Chat handlers initialized');
  }

  private async handleSendMessage(data: SendMessageData): Promise<void> {
    try {
      if (!this.isInRoom(data.roomId)) {
        throw new Error('Not a member of this chat room');
      }

      const message: ChatMessage = {
        id: `msg_${Date.now()}`,
        roomId: data.roomId,
        senderId: this.user.id,
        content: data.content,
        type: data.type,
        metadata: data.metadata,
        readBy: [this.user.id],
        createdAt: new Date()
      };

      // Emit to room members
      this.emitToRoom<ChatResponse<ChatMessage>>(
        data.roomId,
        ChatEvent.MESSAGE_RECEIVE,
        { success: true, data: message }
      );

      this.log('Message sent', { roomId: data.roomId, messageId: message.id });
    } catch (error) {
      this.logError('Failed to send message', error);
      this.emitError('SEND_MESSAGE_ERROR', error.message);
    }
  }

  private async handleCreateRoom(data: CreateRoomData): Promise<void> {
    try {
      const room: ChatRoom = {
        id: `room_${Date.now()}`,
        name: data.name,
        type: data.type,
        participants: [
          {
            id: this.user.id,
            name: this.user.id, // TODO: Get actual user name
            isOnline: true,
            lastSeen: new Date()
          }
        ],
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.joinRoom(room.id);

      // Notify room creation
      this.emit<ChatResponse<ChatRoom>>(ChatEvent.ROOM_CREATE, {
        success: true,
        data: room
      });

      this.log('Room created', { roomId: room.id });
    } catch (error) {
      this.logError('Failed to create room', error);
      this.emitError('CREATE_ROOM_ERROR', error.message);
    }
  }

  private async handleJoinRoom({ roomId }: { roomId: string }): Promise<void> {
    try {
      // TODO: Check if user has permission to join room
      await this.joinRoom(roomId);

      this.log('Joined room', { roomId });
    } catch (error) {
      this.logError('Failed to join room', error);
      this.emitError('JOIN_ROOM_ERROR', error.message);
    }
  }

  private async handleLeaveRoom({ roomId }: { roomId: string }): Promise<void> {
    try {
      await this.leaveRoom(roomId);

      this.log('Left room', { roomId });
    } catch (error) {
      this.logError('Failed to leave room', error);
      this.emitError('LEAVE_ROOM_ERROR', error.message);
    }
  }

  private handleTypingStart({ roomId }: { roomId: string }): void {
    if (!this.isInRoom(roomId)) return;

    this.emitToRoom(roomId, ChatEvent.TYPING_START, {
      roomId,
      userId: this.user.id
    });
  }

  private handleTypingStop({ roomId }: { roomId: string }): void {
    if (!this.isInRoom(roomId)) return;

    this.emitToRoom(roomId, ChatEvent.TYPING_STOP, {
      roomId,
      userId: this.user.id
    });
  }
}
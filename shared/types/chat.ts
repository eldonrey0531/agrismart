import { SocketEventHandler } from '../types/socket';

export enum ChatEvent {
  // Room Events
  ROOM_CREATE = 'chat:room_create',
  ROOM_JOIN = 'chat:room_join',
  ROOM_LEAVE = 'chat:room_leave',
  ROOM_DELETE = 'chat:room_delete',
  
  // Message Events
  MESSAGE_SEND = 'chat:message_send',
  MESSAGE_RECEIVE = 'chat:message_receive',
  MESSAGE_READ = 'chat:message_read',
  
  // Typing Events
  TYPING_START = 'chat:typing_start',
  TYPING_STOP = 'chat:typing_stop',
  
  // Status Events
  USER_ONLINE = 'chat:user_online',
  USER_OFFLINE = 'chat:user_offline',
  
  // System Events
  ERROR = 'chat:error',
  CONNECTED = 'chat:connected',
  DISCONNECTED = 'chat:disconnected'
}

export type MessageType = 'text' | 'image' | 'file';
export type ChatType = 'private' | 'group';

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatType;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  readBy: string[];
  createdAt: Date;
}

export interface SendMessageData {
  roomId: string;
  content: string;
  type: MessageType;
  metadata?: ChatMessage['metadata'];
}

export interface CreateRoomData {
  name: string;
  type: ChatType;
  participantIds: string[];
}

// Event payload types
export interface ChatEventMap {
  [ChatEvent.ROOM_CREATE]: CreateRoomData;
  [ChatEvent.ROOM_JOIN]: { roomId: string };
  [ChatEvent.ROOM_LEAVE]: { roomId: string };
  [ChatEvent.ROOM_DELETE]: { roomId: string };
  [ChatEvent.MESSAGE_SEND]: SendMessageData;
  [ChatEvent.MESSAGE_RECEIVE]: ChatMessage;
  [ChatEvent.MESSAGE_READ]: {
    messageId: string;
    roomId: string;
    userId: string;
  };
  [ChatEvent.TYPING_START]: {
    roomId: string;
    userId: string;
  };
  [ChatEvent.TYPING_STOP]: {
    roomId: string;
    userId: string;
  };
  [ChatEvent.ERROR]: {
    code: string;
    message: string;
    details?: any;
  };
}

// Response types
export interface ChatResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Chat hook options
export interface ChatOptions {
  roomId?: string;
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: ChatEventMap[ChatEvent.ERROR]) => void;
  onTypingStart?: (userId: string) => void;
  onTypingStop?: (userId: string) => void;
}

// Chat state
export interface ChatState {
  messages: ChatMessage[];
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  isLoading: boolean;
  error: ChatEventMap[ChatEvent.ERROR] | null;
  typingUsers: Set<string>;
}

// Chat event handlers
export type ChatEventHandlers = {
  [K in keyof ChatEventMap]: (data: ChatEventMap[K]) => void;
};

// For type exports with aliases
export type { ChatMessage as ChatMessageType };
export { default as Chat } from './Chat';
export { default as ChatWindow } from './ChatWindow';
export { default as ChatList } from './ChatList';
export { default as ChatMessage } from './ChatMessage';
export { default as ChatInput } from './ChatInput';

// Component Props
export type { ChatWindowProps } from './ChatWindow';
export type { ChatListProps } from './ChatList';
export type { ChatMessageProps } from './ChatMessage';
export type { ChatInputProps } from './ChatInput';

// Hook Types
export type { UseChatReturn } from '../../hooks/useChat';

// Re-export types from shared
export type {
  ChatRoom,
  ChatType,
  ChatUser,
  ChatState,
  ChatOptions,
  ChatEventMap,
  ChatResponse,
  SendMessageData,
  CreateRoomData
} from '../../shared/types/chat';

// Re-export message type with alias to avoid naming conflict
export type { ChatMessage as ChatMessageType } from '../../shared/types/chat';
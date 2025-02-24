// Socket and real-time communication
export { useSocket } from './useSocket';
export { useChat } from './useChat';
export { usePost } from './usePost';

// Context switching and network management
export { useContextSwitch } from './useContextSwitch';
export { useNetworkSwitch } from './useNetworkSwitch';

// Types
export type { UseSocketReturn } from './useSocket';
export type { UseChatReturn } from './useChat';
export type { UsePostReturn } from './usePost';
export type { UseContextSwitchReturn } from './useContextSwitch';
export type { UseNetworkSwitchReturn } from './useNetworkSwitch';

// Re-export common types
export type {
  SocketUser,
  SocketAuth,
  SocketOptions,
  SocketEventHandler
} from '../types/socket';

export type {
  ChatMessage,
  ChatRoom,
  ChatType,
  ChatState,
  ChatOptions,
  ChatResponse
} from '../shared/types/chat';

export type {
  Post,
  PostMedia,
  PostComment,
  CreatePostData,
  UpdatePostData,
  PostResponse
} from '../shared/types/post';

export type {
  ContextPriority,
  FeatureContext,
  ContextState,
  ContextMap,
  ContextSwitchConfig,
  ContextSwitchOptions,
  ContextSwitchResult
} from '../shared/types/context-switch';

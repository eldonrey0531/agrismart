import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import {
  ChatEvent,
  ChatState,
  ChatOptions,
  SendMessageData,
  CreateRoomData,
  ChatEventMap,
  ChatResponse,
  ChatMessage,
  ChatRoom
} from '../shared/types/chat';
import { SocketEventHandler } from '../types/socket';

export function useChat(options: ChatOptions = {}) {
  const { socket, userId } = useSocket();
  const [state, setState] = useState<ChatState>({
    messages: [],
    rooms: [],
    currentRoom: null,
    isLoading: false,
    error: null,
    typingUsers: new Set()
  });

  // Message handler
  const handleMessage: SocketEventHandler<ChatMessage> = useCallback((message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      rooms: prev.rooms.map(room => 
        room.id === message.roomId 
          ? { ...room, lastMessage: message }
          : room
      )
    }));
    options.onMessage?.(message);
  }, [options]);

  // Error handler
  const handleError: SocketEventHandler<ChatEventMap[ChatEvent.ERROR]> = useCallback((error) => {
    setState(prev => ({ ...prev, error }));
    options.onError?.(error);
  }, [options]);

  // Room update handler
  const handleRoomUpdate: SocketEventHandler<ChatRoom> = useCallback((room) => {
    setState(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === room.id ? room : r),
      currentRoom: prev.currentRoom?.id === room.id ? room : prev.currentRoom
    }));
  }, []);

  // Typing handlers
  const handleTypingStart: SocketEventHandler<ChatEventMap[ChatEvent.TYPING_START]> = useCallback(({ roomId, userId }) => {
    if (state.currentRoom?.id !== roomId) return;
    
    setState(prev => ({
      ...prev,
      typingUsers: new Set(Array.from(prev.typingUsers).concat(userId))
    }));
    options.onTypingStart?.(userId);
  }, [state.currentRoom, options]);

  const handleTypingStop: SocketEventHandler<ChatEventMap[ChatEvent.TYPING_STOP]> = useCallback(({ roomId, userId }) => {
    if (state.currentRoom?.id !== roomId) return;

    setState(prev => ({
      ...prev,
      typingUsers: new Set(Array.from(prev.typingUsers).filter(id => id !== userId))
    }));
    options.onTypingStop?.(userId);
  }, [state.currentRoom, options]);

  // Setup event listeners
  useEffect(() => {
    if (!socket) return;

    // Register event listeners
    socket.on(ChatEvent.MESSAGE_RECEIVE, handleMessage);
    socket.on(ChatEvent.ERROR, handleError);
    socket.on(ChatEvent.TYPING_START, handleTypingStart);
    socket.on(ChatEvent.TYPING_STOP, handleTypingStop);
    socket.on(ChatEvent.ROOM_CREATE, handleRoomUpdate);
    socket.on(ChatEvent.ROOM_JOIN, handleRoomUpdate);

    return () => {
      // Cleanup event listeners
      socket.off(ChatEvent.MESSAGE_RECEIVE, handleMessage);
      socket.off(ChatEvent.ERROR, handleError);
      socket.off(ChatEvent.TYPING_START, handleTypingStart);
      socket.off(ChatEvent.TYPING_STOP, handleTypingStop);
      socket.off(ChatEvent.ROOM_CREATE, handleRoomUpdate);
      socket.off(ChatEvent.ROOM_JOIN, handleRoomUpdate);
    };
  }, [
    socket,
    handleMessage,
    handleError,
    handleTypingStart,
    handleTypingStop,
    handleRoomUpdate
  ]);

  // Initialize chat room
  useEffect(() => {
    if (options.roomId && socket) {
      joinRoom(options.roomId);
    }
    return () => {
      if (options.roomId && socket) {
        leaveRoom(options.roomId);
      }
    };
  }, [options.roomId, socket]);

  // Chat actions
  const sendMessage = useCallback((content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!socket || !state.currentRoom || !userId) {
      handleError({
        code: 'NO_ACTIVE_ROOM',
        message: 'Cannot send message: No active room or not connected'
      });
      return;
    }

    const messageData: SendMessageData = {
      roomId: state.currentRoom.id,
      content,
      type
    };

    socket.emit(ChatEvent.MESSAGE_SEND, messageData);
  }, [socket, state.currentRoom, userId]);

  const createRoom = useCallback(async (data: CreateRoomData): Promise<ChatRoom> => {
    if (!socket || !userId) {
      throw new Error('Not connected to chat service');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    return new Promise((resolve, reject) => {
      socket.emit(ChatEvent.ROOM_CREATE, data, (response: ChatResponse<ChatRoom>) => {
        setState(prev => ({ ...prev, isLoading: false }));
        
        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            rooms: [...prev.rooms, response.data!]
          }));
          resolve(response.data);
        } else {
          const error = response.error || {
            code: 'CREATE_ROOM_ERROR',
            message: 'Failed to create room'
          };
          handleError(error);
          reject(error);
        }
      });
    });
  }, [socket, userId]);

  const joinRoom = useCallback((roomId: string) => {
    if (!socket || !userId) return;

    setState(prev => ({ ...prev, isLoading: true }));
    socket.emit(ChatEvent.ROOM_JOIN, { roomId });

    const room = state.rooms.find(r => r.id === roomId);
    if (room) {
      setState(prev => ({
        ...prev,
        currentRoom: room,
        isLoading: false
      }));
    }
  }, [socket, userId, state.rooms]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!socket || !userId) return;

    socket.emit(ChatEvent.ROOM_LEAVE, { roomId });
    setState(prev => ({
      ...prev,
      currentRoom: null,
      messages: []
    }));
  }, [socket, userId]);

  const startTyping = useCallback(() => {
    if (!socket || !state.currentRoom || !userId) return;

    socket.emit(ChatEvent.TYPING_START, {
      roomId: state.currentRoom.id,
      userId
    });
  }, [socket, state.currentRoom, userId]);

  const stopTyping = useCallback(() => {
    if (!socket || !state.currentRoom || !userId) return;

    socket.emit(ChatEvent.TYPING_STOP, {
      roomId: state.currentRoom.id,
      userId
    });
  }, [socket, state.currentRoom, userId]);

  return {
    // State
    ...state,

    // Actions
    sendMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,

    // Reset functions
    clearError: useCallback(() => setState(prev => ({ ...prev, error: null })), []),
    clearMessages: useCallback(() => setState(prev => ({ ...prev, messages: [] })), [])
  } as const;
}

// Export types for components
export type UseChatReturn = ReturnType<typeof useChat>;
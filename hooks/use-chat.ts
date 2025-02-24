import { useState, useCallback, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import {
  IMessage,
  IConversation,
  IMessageResponse,
  IConversationsResponse,
  IMessagesResponse,
} from "@/types/chat";
import { 
  ServerToClientEvents,
  ClientToServerEvents,
  TypingEvent, 
  PresenceEvent, 
  ConnectionError 
} from "@/types/socket";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./use-auth";
import { api } from "@/lib/api/client";
import { API_ROUTES, WS_URL } from "@/lib/api/constants";
import type { WebSocketClient } from "@/types/socketio";

interface ChatState {
  conversations: IConversation[];
  activeConversation: string | null;
  messages: Record<string, IMessage[]>;
  loading: boolean;
  error: string | null;
  typingUsers: Record<string, Set<string>>;
}

export function useChat() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocketClient | null>(null);
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: {},
    loading: false,
    error: null,
    typingUsers: {},
  });

  // WebSocket setup with authentication
  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }) as WebSocketClient;

    newSocket.on("connect", () => {
      console.log("WebSocket connected");
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    newSocket.on("connect_error", (error: ConnectionError) => {
      console.error("WebSocket connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error.message || "Failed to connect to chat server",
      });
    });

    // Handle incoming messages
    newSocket.on("message", (message: IMessage) => {
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [message.conversation]: [
            ...(prev.messages[message.conversation] || []),
            message,
          ],
        },
        conversations: prev.conversations.map(conv =>
          conv.id === message.conversation
            ? { ...conv, lastMessage: message }
            : conv
        ),
      }));
    });

    // Handle typing indicators
    newSocket.on("typing", ({ conversationId, userId, isTyping }: TypingEvent) => {
      setState(prev => {
        const typingUsers = { ...prev.typingUsers };
        if (!typingUsers[conversationId]) {
          typingUsers[conversationId] = new Set();
        }

        if (isTyping) {
          typingUsers[conversationId].add(userId);
        } else {
          typingUsers[conversationId].delete(userId);
        }

        return { ...prev, typingUsers };
      });
    });

    // Handle user presence
    newSocket.on("presence", ({ userId, isOnline }: PresenceEvent) => {
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => ({
          ...conv,
          participants: conv.participants.map(p =>
            p.id === userId ? { ...p, isOnline } : p
          ),
        })),
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token, toast]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get<IConversationsResponse>(
        API_ROUTES.CHAT.CONVERSATIONS
      );

      setState(prev => ({
        ...prev,
        conversations: response.conversations,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to load conversations",
        loading: false,
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversations",
      });
    }
  }, [user, toast]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await api.get<IMessagesResponse>(
        API_ROUTES.CHAT.MESSAGES(conversationId)
      );

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: response.messages,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to load messages",
        loading: false,
      }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages",
      });
    }
  }, [user, toast]);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    attachments?: File[]
  ) => {
    if (!user || !content.trim()) return null;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: IMessage = {
      id: tempId,
      sender: user.id,
      conversation: conversationId,
      content,
      readBy: [user.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
    };

    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [conversationId]: [
          ...(prev.messages[conversationId] || []),
          optimisticMessage,
        ],
      },
    }));

    try {
      let response: IMessageResponse;
      
      if (attachments?.length) {
        response = await api.upload<IMessageResponse>(
          API_ROUTES.CHAT.MESSAGES(conversationId),
          attachments,
          { content }
        );
      } else {
        response = await api.post<IMessageResponse>(
          API_ROUTES.CHAT.MESSAGES(conversationId),
          { content }
        );
      }

      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: prev.messages[conversationId].map(msg =>
            msg.id === tempId ? response.message : msg
          ),
        },
      }));

      return response.message;
    } catch (error) {
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [conversationId]: prev.messages[conversationId].filter(
            msg => msg.id !== tempId
          ),
        },
      }));

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
      return null;
    }
  }, [user, toast]);

  const setTypingStatus = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socket || !user) return;
    socket.emit("typing", { conversationId, isTyping });
  }, [socket, user]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    setState(prev => ({ ...prev, activeConversation: conversationId }));
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [fetchMessages]);

  return {
    ...state,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setTypingStatus,
    setActiveConversation,
    isConnected: socket?.connected || false,
  };
}

export type { ChatState };
import React, { useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { IConversation } from "@/types/chat";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedId?: string;
}

export function ConversationList({
  onSelectConversation,
  selectedId,
}: ConversationListProps) {
  const { user } = useAuth();
  const { conversations, loading, error, fetchConversations } = useChat();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading conversations
      </div>
    );
  }

  if (loading && !conversations.length) {
    return (
      <div className="p-4">
        Loading conversations...
      </div>
    );
  }

  const getOtherParticipant = (conversation: IConversation) => {
    return conversation.participants.find(p => p.id !== user?.id);
  };

  return (
    <div className="divide-y">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const unreadCount = conversation.unreadCount || 0;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors ${
              selectedId === conversation.id ? "bg-accent" : ""
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {otherParticipant?.avatar ? (
                  <img
                    src={otherParticipant.avatar}
                    alt={otherParticipant.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg">
                    {otherParticipant?.name.charAt(0)}
                  </span>
                )}
              </div>
              {otherParticipant?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            {/* Conversation Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="font-medium truncate">
                  {otherParticipant?.name}
                </p>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage?.content || "No messages yet"}
                </p>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {conversations.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No conversations yet
        </div>
      )}
    </div>
  );
}
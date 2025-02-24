"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";

export function ChatLayout() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { activeConversation, setActiveConversation } = useChat();

  // Handle authentication
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/chat')}`);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <ChatSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/10 shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Messages</h2>
          <button
            onClick={() => setActiveConversation(null)}
            className="text-sm text-primary hover:underline"
          >
            New Chat
          </button>
        </div>
        <ConversationList
          selectedId={activeConversation || undefined}
          onSelectConversation={(id) => setActiveConversation(id)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ChatWindow conversationId={activeConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <h3 className="font-medium mb-1">Welcome to Chat</h3>
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Skeleton */}
      <div className="w-80 border-r bg-muted/10 shrink-0">
        <div className="p-4 border-b">
          <div className="h-6 bg-muted rounded w-24 animate-pulse" />
        </div>
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-3 bg-muted rounded w-32 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1" />
    </div>
  );
}

// Export for Next.js layout system
export default function ChatLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatLayout />
    </>
  );
}
import React, { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export interface ChatWindowProps {
  roomId: string;
  currentUserId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    error,
    currentRoom,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  } = useChat({
    roomId,
    onError: (error) => console.error('Chat error:', error)
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading chat room...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold text-lg">{currentRoom.name}</h2>
        {typingUsers.size > 0 && (
          <p className="text-sm text-gray-500 italic">
            {Array.from(typingUsers)
              .map(userId => currentRoom.participants.find(p => p.id === userId)?.name)
              .filter(Boolean)
              .join(', ')}{' '}
            is typing...
          </p>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 my-4">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-100 text-red-600 text-sm text-center">
          {error.message}
        </div>
      )}

      {/* Chat Input */}
      <div className="bg-white">
        <ChatInput
          onSendMessage={sendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
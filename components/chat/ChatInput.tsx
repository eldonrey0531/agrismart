import React, { useState, useRef, useCallback } from 'react';

export interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      onStartTyping();
    }

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
      typingTimeoutRef.current = undefined;
    }, 1000);
  }, [onStartTyping, onStopTyping]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage('');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      onStopTyping();
    }
  }, [message, disabled, onSendMessage, onStopTyping]);

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 border-t"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="px-4 py-2 rounded-full bg-blue-500 text-white disabled:bg-gray-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
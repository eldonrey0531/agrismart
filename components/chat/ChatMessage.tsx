import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessageType } from './index';

export interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const messageClass = isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100';
  const alignmentClass = isOwnMessage ? 'ml-auto' : 'mr-auto';

  return (
    <div className={`flex flex-col max-w-[70%] ${alignmentClass} mb-4`}>
      <div className={`rounded-lg px-4 py-2 ${messageClass}`}>
        {message.type === 'text' && <p>{message.content}</p>}
        {message.type === 'image' && (
          <img 
            src={message.content} 
            alt="Shared image"
            className="max-w-full rounded"
            loading="lazy"
          />
        )}
        {message.type === 'file' && (
          <a 
            href={message.content}
            className="flex items-center text-sm underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
            {message.metadata?.fileName || 'Download file'}
          </a>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
};

export default ChatMessage;
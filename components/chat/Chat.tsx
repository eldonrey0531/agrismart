import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../hooks/useAuth';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in to access chat.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Chat List Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatList
          currentUserId={user.id}
          onRoomSelect={(roomId) => setSelectedRoomId(roomId)}
        />
      </div>

      {/* Chat Window or Welcome Screen */}
      <div className="flex-1">
        {selectedRoomId ? (
          <ChatWindow
            roomId={selectedRoomId}
            currentUserId={user.id}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-xl font-medium mb-2">
                Welcome to Chat
              </h3>
              <p className="text-gray-400">
                Select a chat room from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
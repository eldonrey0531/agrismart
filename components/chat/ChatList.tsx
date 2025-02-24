import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { ChatRoom, ChatType } from '../../shared/types/chat';
import { formatDistanceToNow } from 'date-fns';

export interface ChatListProps {
  currentUserId: string;
  onRoomSelect: (roomId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ currentUserId, onRoomSelect }) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const {
    rooms,
    isLoading,
    error,
    currentRoom,
    createRoom
  } = useChat();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setIsCreatingRoom(true);
      const room = await createRoom({
        name: newRoomName.trim(),
        type: 'group' as ChatType,
        participantIds: [currentUserId]
      });
      onRoomSelect(room.id);
      setNewRoomName('');
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const renderRoom = (room: ChatRoom) => {
    const isActive = currentRoom?.id === room.id;
    const unreadCount = room.unreadCount;
    const lastMessage = room.lastMessage;

    return (
      <button
        key={room.id}
        onClick={() => onRoomSelect(room.id)}
        className={`
          w-full px-4 py-3 flex items-start border-b last:border-b-0
          hover:bg-gray-50 transition-colors
          ${isActive ? 'bg-blue-50' : ''}
        `}
      >
        {/* Room Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
          {room.type === 'group' ? (
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
          ) : (
            <span className="text-lg text-gray-500">
              {room.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Room Info */}
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{room.name}</h3>
            {lastMessage && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500 truncate">
              {lastMessage?.content || 'No messages yet'}
            </p>
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col border-r">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold text-lg">Chats</h2>
      </div>

      {/* New Room Form */}
      <form onSubmit={handleCreateRoom} className="p-4 border-b bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Create new chat..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreatingRoom}
          />
          <button
            type="submit"
            disabled={isCreatingRoom || !newRoomName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </form>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading chats...</div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats yet</div>
        ) : (
          rooms.map(renderRoom)
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-600 text-sm">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default ChatList;
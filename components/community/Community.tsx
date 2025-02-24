import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import PostList from './PostList';

export interface CommunityProps {
  className?: string;
}

export const Community: React.FC<CommunityProps> = ({ className = '' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md mx-auto px-4">
          <svg
            className="w-16 h-16 text-gray-400 mb-4 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">Welcome to AgriSmart Community</h2>
          <p className="text-gray-600 mb-6">
            Join our community of farmers, experts, and enthusiasts to share knowledge,
            experiences, and support each other.
          </p>
          <p className="text-gray-500">
            Please sign in to participate in discussions and share your insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Community Header */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
            <p className="mt-1 text-gray-500">
              Share your farming experiences and learn from others
            </p>
          </div>
        </div>

        {/* Community Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <PostList currentUserId={user.id} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              {/* Community Guidelines */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Share valuable farming experiences and insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Be respectful and supportive of other members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Use appropriate tags for better content organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>No spam or promotional content without approval</span>
                  </li>
                </ul>
              </div>

              {/* Trending Tags */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['#OrganicFarming', '#Sustainability', '#Innovation', '#Tips', '#Success'].map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
import React, { useState } from 'react';
import { usePost } from '../../hooks/usePost';
import { Post, PostMedia } from '../../shared/types/post';
import { formatDistanceToNow } from 'date-fns';

export interface PostListProps {
  currentUserId: string;
}

const PostList: React.FC<PostListProps> = ({ currentUserId }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const {
    posts,
    isLoading,
    error,
    createPost,
    likePost,
    addComment,
    deletePost,
    deleteComment
  } = usePost({
    onError: (error) => console.error('Post error:', error)
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    createPost({
      content: newPostContent.trim(),
      media: [],
      tags: []
    });
    setNewPostContent('');
  };

  const renderMedia = (media: PostMedia) => {
    if (media.type === 'image') {
      return (
        <img
          src={media.url}
          alt="Post media"
          className="rounded-lg max-h-96 object-cover"
          loading="lazy"
        />
      );
    }

    if (media.type === 'video') {
      return (
        <video
          src={media.url}
          controls
          poster={media.thumbnail}
          className="rounded-lg max-h-96"
        />
      );
    }

    return null;
  };

  const renderPost = (post: Post) => {
    const isAuthor = post.authorId === currentUserId;

    return (
      <div key={post.id} className="bg-white rounded-lg shadow p-4 mb-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">{post.authorId}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isAuthor && (
            <button
              onClick={() => deletePost(post.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>

        {/* Post Content */}
        <p className="text-gray-800 mb-4">{post.content}</p>

        {/* Post Media */}
        {post.media.length > 0 && (
          <div className="mb-4 grid gap-2">
            {post.media.map((media, index) => (
              <div key={index}>{renderMedia(media)}</div>
            ))}
          </div>
        )}

        {/* Post Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => likePost(post.id)}
            className={`flex items-center gap-1 ${
              post.likes.includes(currentUserId)
                ? 'text-blue-500'
                : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <span>{post.likes.length}</span>
            <span>Likes</span>
          </button>
          <button className="text-gray-500 hover:text-blue-500">
            <span>{post.comments.length}</span>
            <span className="ml-1">Comments</span>
          </button>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          {post.comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 bg-gray-50 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{comment.authorId}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="mb-8">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!newPostContent.trim() || isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
          {error.message}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">Loading posts...</div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map(renderPost)
        )}
      </div>
    </div>
  );
};

export { PostList };
export default PostList;
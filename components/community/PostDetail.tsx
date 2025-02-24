import React, { useState, useEffect } from 'react';
import { usePost } from '../../hooks/usePost';
import { Post, Comment, ReactionType, CreateCommentData } from '../../shared/types/post';

interface PostDetailProps {
  postId: string;
  onBack?: () => void;
}

export function PostDetail({ postId, onBack }: PostDetailProps) {
  const {
    posts,
    createComment,
    addReaction,
    removeReaction,
    getPostComments,
    getPostReactions,
    getCommentReactions
  } = usePost(postId);

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const post = posts.find(p => p.id === postId);
  const comments = getPostComments(postId);

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData: CreateCommentData = {
      content: newComment.trim(),
      postId,
      parentId: replyTo || undefined
    };

    createComment(commentData);
    setNewComment('');
    setReplyTo(null);
  };

  const handleReaction = (type: ReactionType, targetId: string, isComment: boolean = false) => {
    if (isComment) {
      addReaction({ commentId: targetId, type });
    } else {
      addReaction({ postId: targetId, type });
    }
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Post content */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-gray-600">{post.content}</p>

        {/* Post images */}
        {post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center space-x-4 py-2 border-t">
          {Object.values(ReactionType).map((type) => (
            <button
              key={type}
              onClick={() => handleReaction(type, post.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
            >
              <span>{type}</span>
              <span>{getPostReactions(post.id).filter(r => r.type === type).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comment form */}
      <form onSubmit={handleCreateComment} className="space-y-4">
        <div className="flex flex-col space-y-2">
          {replyTo && (
            <div className="flex items-center text-sm text-gray-500">
              <span>Replying to comment</span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Post Comment
        </button>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment: Comment) => (
          <div key={comment.id} className="bg-white rounded-lg shadow p-4 space-y-2">
            <p className="text-gray-800">{comment.content}</p>
            
            {/* Comment reactions */}
            <div className="flex items-center space-x-4 text-sm">
              {Object.values(ReactionType).map((type) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type, comment.id, true)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                >
                  <span>{type}</span>
                  <span>{getCommentReactions(comment.id).filter(r => r.type === type).length}</span>
                </button>
              ))}
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
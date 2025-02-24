import React from 'react';
import { Post as PostType, PostMedia } from '../../../shared/types/post';
import { formatDistanceToNow } from 'date-fns';
import CommentList from './CommentList';
import CommentInput from './CommentInput';

export interface PostProps {
  post: PostType;
  currentUserId: string;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onComment: (postId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  isLoading?: boolean;
}

const Post: React.FC<PostProps> = ({
  post,
  currentUserId,
  onDelete,
  onLike,
  onComment,
  onDeleteComment,
  isLoading = false
}) => {
  const isAuthor = post.authorId === currentUserId;

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

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
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
            onClick={() => onDelete(post.id)}
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
          onClick={() => onLike(post.id)}
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

      {/* Comments Section */}
      <div className="border-t pt-4">
        <CommentList
          comments={post.comments}
          currentUserId={currentUserId}
          onDelete={(commentId) => onDeleteComment(post.id, commentId)}
        />
        <CommentInput
          postId={post.id}
          onSubmit={onComment}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export { Post };
export default Post;
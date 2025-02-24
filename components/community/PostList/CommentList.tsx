import React from 'react';
import { PostComment } from '../../../shared/types/post';
import { formatDistanceToNow } from 'date-fns';

export interface CommentListProps {
  comments: PostComment[];
  currentUserId: string;
  onDelete?: (commentId: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUserId,
  onDelete
}) => {
  if (comments.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-2">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-2 mb-4">
      {comments.map(comment => (
        <div key={comment.id} className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{comment.authorId}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true
                    })}
                  </span>
                  {comment.authorId === currentUserId && onDelete && (
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-800 mt-1 break-words">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { CommentList };
export default CommentList;
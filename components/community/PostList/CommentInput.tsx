import React, { useState } from 'react';

export interface CommentInputProps {
  postId: string;
  onSubmit: (postId: string, content: string) => void;
  disabled?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  onSubmit,
  disabled = false
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSubmit(postId, content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          disabled={disabled}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600"
        >
          Comment
        </button>
      </div>
    </form>
  );
};

export { CommentInput };
export default CommentInput;
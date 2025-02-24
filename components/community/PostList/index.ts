// Export components
export { default as Post } from './Post';
export { default as CommentList } from './CommentList';
export { default as CommentInput } from './CommentInput';

// Export component prop types
export type { PostProps } from './Post';
export type { CommentListProps } from './CommentList';
export type { CommentInputProps } from './CommentInput';

// Re-export types from shared
export type {
  Post as PostType,
  PostMedia,
  PostComment
} from '../../../shared/types/post';
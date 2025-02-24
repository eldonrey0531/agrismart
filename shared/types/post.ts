import { SocketEventHandler } from '../../types/socket';

export enum PostEvent {
  // Post events
  CREATE = 'post:create',
  CREATED = 'post:created',
  UPDATE = 'post:update',
  UPDATED = 'post:updated',
  DELETE = 'post:delete',
  DELETED = 'post:deleted',

  // Interaction events
  LIKE = 'post:like',
  LIKED = 'post:liked',
  COMMENT = 'post:comment',
  COMMENTED = 'post:commented',
  COMMENT_DELETE = 'post:comment_delete',
  COMMENT_DELETED = 'post:comment_deleted',

  // Error events
  ERROR = 'post:error'
}

export enum PostErrorCode {
  CREATE_ERROR = 'POST_CREATE_ERROR',
  UPDATE_ERROR = 'POST_UPDATE_ERROR',
  DELETE_ERROR = 'POST_DELETE_ERROR',
  LIKE_ERROR = 'POST_LIKE_ERROR',
  COMMENT_ERROR = 'POST_COMMENT_ERROR',
  DELETE_COMMENT_ERROR = 'POST_DELETE_COMMENT_ERROR'
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  media: PostMedia[];
  tags: string[];
  likes: string[]; // Array of user IDs
  comments: PostComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface CreatePostData {
  content: string;
  media?: PostMedia[];
  tags?: string[];
}

export interface UpdatePostData {
  id: string;
  content?: string;
  media?: PostMedia[];
  tags?: string[];
}

export interface PostResponse<T> {
  success: true;
  data: T;
}

export interface PostErrorResponse {
  success: false;
  code: PostErrorCode;
  message: string;
  details?: any;
}

// Event payload types
export interface PostEventMap {
  [PostEvent.CREATE]: CreatePostData;
  [PostEvent.CREATED]: PostResponse<Post>;
  [PostEvent.UPDATE]: UpdatePostData;
  [PostEvent.UPDATED]: PostResponse<Partial<Post>>;
  [PostEvent.DELETE]: { id: string };
  [PostEvent.DELETED]: PostResponse<{ id: string }>;
  [PostEvent.LIKE]: { id: string };
  [PostEvent.LIKED]: PostResponse<{ postId: string; userId: string }>;
  [PostEvent.COMMENT]: { postId: string; content: string };
  [PostEvent.COMMENTED]: PostResponse<PostComment>;
  [PostEvent.COMMENT_DELETE]: { postId: string; commentId: string };
  [PostEvent.COMMENT_DELETED]: PostResponse<{ postId: string; commentId: string }>;
  [PostEvent.ERROR]: PostErrorResponse;
}

// Event handler types
export type PostEventHandlers = {
  [K in PostEvent]: SocketEventHandler<PostEventMap[K]>;
};
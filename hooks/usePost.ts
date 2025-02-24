import { useCallback, useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import {
  Post,
  PostEvent,
  PostComment,
  CreatePostData,
  UpdatePostData,
  PostResponse,
  PostErrorResponse
} from '../shared/types/post';

export interface UsePostOptions {
  onError?: (error: PostErrorResponse) => void;
  onPostCreated?: (post: Post) => void;
  onPostUpdated?: (post: Partial<Post>) => void;
  onPostDeleted?: (postId: string) => void;
  onCommentAdded?: (comment: PostComment) => void;
  onCommentDeleted?: (data: { postId: string; commentId: string }) => void;
}

export interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: PostErrorResponse | null;
}

export function usePost(options: UsePostOptions = {}) {
  const { socket } = useSocket();
  const [state, setState] = useState<PostState>({
    posts: [],
    isLoading: false,
    error: null
  });

  // Event handlers
  useEffect(() => {
    if (!socket) return;

    const handlePostCreated = (response: PostResponse<Post>) => {
      if (response.success) {
        setState(prev => ({
          ...prev,
          posts: [response.data, ...prev.posts]
        }));
        options.onPostCreated?.(response.data);
      }
    };

    const handlePostUpdated = (response: PostResponse<Partial<Post>>) => {
      if (response.success) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === response.data.id
              ? { ...post, ...response.data }
              : post
          )
        }));
        options.onPostUpdated?.(response.data);
      }
    };

    const handlePostDeleted = (response: PostResponse<{ id: string }>) => {
      if (response.success) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post.id !== response.data.id)
        }));
        options.onPostDeleted?.(response.data.id);
      }
    };

    const handleCommentAdded = (response: PostResponse<PostComment>) => {
      if (response.success) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === response.data.postId
              ? { ...post, comments: [...post.comments, response.data] }
              : post
          )
        }));
        options.onCommentAdded?.(response.data);
      }
    };

    const handleCommentDeleted = (
      response: PostResponse<{ postId: string; commentId: string }>
    ) => {
      if (response.success) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post =>
            post.id === response.data.postId
              ? {
                  ...post,
                  comments: post.comments.filter(c => c.id !== response.data.commentId)
                }
              : post
          )
        }));
        options.onCommentDeleted?.(response.data);
      }
    };

    const handleError = (error: PostErrorResponse) => {
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
    };

    // Register event listeners
    socket.on(PostEvent.CREATED, handlePostCreated);
    socket.on(PostEvent.UPDATED, handlePostUpdated);
    socket.on(PostEvent.DELETED, handlePostDeleted);
    socket.on(PostEvent.COMMENTED, handleCommentAdded);
    socket.on(PostEvent.COMMENT_DELETED, handleCommentDeleted);
    socket.on(PostEvent.ERROR, handleError);

    return () => {
      // Cleanup event listeners
      socket.off(PostEvent.CREATED, handlePostCreated);
      socket.off(PostEvent.UPDATED, handlePostUpdated);
      socket.off(PostEvent.DELETED, handlePostDeleted);
      socket.off(PostEvent.COMMENTED, handleCommentAdded);
      socket.off(PostEvent.COMMENT_DELETED, handleCommentDeleted);
      socket.off(PostEvent.ERROR, handleError);
    };
  }, [socket, options]);

  // Actions
  const createPost = useCallback((data: CreatePostData) => {
    if (!socket) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    socket.emit(PostEvent.CREATE, data);
  }, [socket]);

  const updatePost = useCallback((id: string, data: Partial<UpdatePostData>) => {
    if (!socket) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    socket.emit(PostEvent.UPDATE, { id, ...data });
  }, [socket]);

  const deletePost = useCallback((id: string) => {
    if (!socket) return;
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    socket.emit(PostEvent.DELETE, { id });
  }, [socket]);

  const likePost = useCallback((id: string) => {
    if (!socket) return;
    socket.emit(PostEvent.LIKE, { id });
  }, [socket]);

  const addComment = useCallback((postId: string, content: string) => {
    if (!socket) return;
    socket.emit(PostEvent.COMMENT, { postId, content });
  }, [socket]);

  const deleteComment = useCallback((postId: string, commentId: string) => {
    if (!socket) return;
    socket.emit(PostEvent.COMMENT_DELETE, { postId, commentId });
  }, [socket]);

  return {
    // State
    ...state,

    // Actions
    createPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    deleteComment,

    // Reset functions
    clearError: useCallback(() => setState(prev => ({ ...prev, error: null })), []),
    clearPosts: useCallback(() => setState(prev => ({ ...prev, posts: [] })), [])
  } as const;
}

export type UsePostReturn = ReturnType<typeof usePost>;
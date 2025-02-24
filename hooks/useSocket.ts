import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
  CustomClientSocket,
  SocketEventHandler,
  SocketOptions,
  SocketAuth,
  SocketEvent
} from '../types/socket';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

const DEFAULT_OPTIONS: SocketOptions = {
  path: '/api/socket',
  transports: ['websocket']
};

export interface SocketInstance {
  socket: CustomClientSocket | null;
  isConnected: boolean;
  userId: string | null;
  connect: () => void;
  disconnect: () => void;
  on: <T>(event: string, handler: SocketEventHandler<T>) => void;
  off: <T>(event: string, handler: SocketEventHandler<T>) => void;
  emit: <T>(event: string, data: T) => void;
}

export function useSocket(options: Partial<SocketOptions> = {}): SocketInstance {
  const socketRef = useRef<CustomClientSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      // Get stored auth data
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');

      const auth: SocketAuth = {
        userId: storedUserId,
        token: storedToken
      };

      socketRef.current = io(SOCKET_URL, {
        ...DEFAULT_OPTIONS,
        ...options,
        auth
      }) as CustomClientSocket;

      // Set up connection handlers
      socketRef.current.on(SocketEvent.CONNECT, () => {
        setIsConnected(true);
        const authUserId = socketRef.current?.auth?.userId;
        if (typeof authUserId === 'string' && authUserId) {
          setUserId(authUserId);
          localStorage.setItem('userId', authUserId);
        }
      });

      socketRef.current.on(SocketEvent.DISCONNECT, () => {
        setIsConnected(false);
      });

      socketRef.current.on(SocketEvent.ERROR, (error: Error) => {
        console.error('Socket error:', error);
        if (error.message === 'auth_error') {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUserId(null);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
        setUserId(null);
      }
    };
  }, [options]);

  const connect = useCallback(() => {
    if (!socketRef.current?.connected) {
      socketRef.current?.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current?.disconnect();
    }
  }, []);

  const on = useCallback(<T>(event: string, handler: SocketEventHandler<T>) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback(<T>(event: string, handler: SocketEventHandler<T>) => {
    socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback(<T>(event: string, data: T) => {
    socketRef.current?.emit(event, data);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    userId,
    connect,
    disconnect,
    on,
    off,
    emit
  };
}

export type UseSocketReturn = ReturnType<typeof useSocket>;
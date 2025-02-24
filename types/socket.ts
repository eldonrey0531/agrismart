import { Socket as ClientSocket } from 'socket.io-client';
import { Socket as ServerSocket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { JwtPayload } from 'jsonwebtoken';

// Event handler types
export type SocketEventHandler<T = any> = (data: T) => void;

// Base event interface
export interface BaseEventMap {
  [event: string]: any;
}

// Extend Socket.IO's DefaultEventsMap
export interface SocketEventMap extends DefaultEventsMap {
  [event: string]: any;
}

// Custom JWT payload
export interface SocketJwtPayload extends JwtPayload {
  id: string;
  role: UserRole;
  accountLevel: AccountLevel;
}

// User roles and account levels
export type UserRole = 'ADMIN' | 'SELLER' | 'USER';
export type AccountLevel = 'FREE' | 'PREMIUM' | 'ENTERPRISE';

// Auth data interface
export interface SocketAuth {
  userId?: string | null;
  token?: string | null;
}

// User type for socket authentication
export interface SocketUser {
  id: string;
  role: UserRole;
  accountLevel: AccountLevel;
  isActive: boolean;
  lastSeen: Date;
}

// Client socket with proper type inheritance
export type CustomClientSocket = ClientSocket<SocketEventMap, SocketEventMap> & {
  auth: SocketAuth;
  connected: boolean;
  on<Ev extends keyof SocketEventMap>(
    event: Ev,
    handler: SocketEventHandler<SocketEventMap[Ev]>
  ): CustomClientSocket;
  emit<Ev extends keyof SocketEventMap>(
    event: Ev,
    data: SocketEventMap[Ev]
  ): CustomClientSocket;
};

// Server socket with proper type inheritance
export type CustomServerSocket = ServerSocket<SocketEventMap, SocketEventMap> & {
  auth: SocketAuth;
  user: SocketUser;
  connected: boolean;
  on<Ev extends keyof SocketEventMap>(
    event: Ev,
    handler: SocketEventHandler<SocketEventMap[Ev]>
  ): CustomServerSocket;
  emit<Ev extends keyof SocketEventMap>(
    event: Ev,
    data: SocketEventMap[Ev]
  ): CustomServerSocket;
};

// Socket event type for components
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  AUTH = 'auth'
}

// Handler base class
export abstract class BaseSocketHandler {
  constructor(protected socket: CustomServerSocket) {}
  abstract setupHandlers(): void;
}

// Handler context type for socket handlers
export interface SocketHandlerContext {
  socket: CustomServerSocket;
  user: SocketUser;
}

// Helper type for event registration
export type EventHandlerMap<T extends SocketEventMap> = {
  [K in keyof T]: SocketEventHandler<T[K]>;
};

// Helper type for socket options
export interface SocketOptions {
  path?: string;
  transports?: string[];
  auth?: SocketAuth;
}

// Helper type for socket middleware
export type SocketMiddleware = (
  socket: CustomServerSocket,
  next: (err?: Error) => void
) => void | Promise<void>;
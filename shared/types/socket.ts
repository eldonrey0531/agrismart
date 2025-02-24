import { Role } from '@prisma/client';
import { MarketplaceEvent } from './marketplace';
import { ChatEvent } from './chat';
import { PostEvent } from './post';

export interface SocketUser {
  id: string;
  role: Role;
  isActive: boolean;
}

export enum BaseSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  JOIN = 'join',
  LEAVE = 'leave'
}

export type SocketEvent = 
  | BaseSocketEvent 
  | MarketplaceEvent
  | ChatEvent
  | PostEvent;

export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export type SocketRoom = 
  | `user:${string}`
  | `role:${Role}`
  | `post:${string}`
  | `comment:${string}`
  | `product:${string}`
  | `category:${string}`
  | `chat:${string}`;

export interface SocketOptions {
  auth: {
    token: string;
  };
  transports: string[];
  path: string;
}

export interface SocketPayload<T = any> {
  event: SocketEvent;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  room?: string;
  timestamp?: Date;
}

export interface SocketClient {
  id: string;
  userId: string;
  rooms: Set<string>;
  lastActivity: Date;
  device?: {
    type: string;
    os: string;
    client: string;
  };
}
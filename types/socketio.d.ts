import { Socket as SocketIOClientSocket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket";

declare module "socket.io-client" {
  export interface Socket<
    ListenEvents extends {} = ServerToClientEvents,
    EmitEvents extends {} = ClientToServerEvents
  > extends SocketIOClientSocket<ListenEvents, EmitEvents> {}
}

// Re-export the Socket type with our custom events
export type WebSocketClient = SocketIOClientSocket<ServerToClientEvents, ClientToServerEvents>;

// Export connection options type
export interface WebSocketOptions {
  auth?: {
    token: string;
  };
  transports?: string[];
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}
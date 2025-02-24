import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import type { ServerToClientEvents, ClientToServerEvents, SocketAuthPayload } from "@/types/socket";
import { JWT_SECRET } from "./config";

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const decoded = jwt.verify(token, JWT_SECRET) as SocketAuthPayload;
      if (!decoded) {
        throw new Error("Invalid token");
      }

      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user?.id;
    console.log(`User connected: ${userId}`);

    // Notify others about user's presence
    socket.broadcast.emit("presence", {
      userId,
      isOnline: true,
    });

    // Handle joining conversation rooms
    socket.on("join", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation: ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on("leave", (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    // Handle typing events
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit("typing", {
        conversationId,
        userId,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      io.emit("presence", {
        userId,
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });
    });
  });

  return io;
}

export type SocketIOServer = ReturnType<typeof setupSocketIO>;
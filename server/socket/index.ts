import { Server, ServerOptions } from 'socket.io';
import { Server as HttpServer } from 'http';
import { CustomServerSocket } from '../../types/socket';
import { authMiddleware } from './middleware/auth';

// Import handlers
import { ChatHandler } from './handlers/chat';
import { PostHandler } from './handlers/post';
import { MarketplaceHandler } from './handlers/marketplace';

// Server configuration
const DEFAULT_OPTIONS: Partial<ServerOptions> = {
  path: '/api/socket',
  transports: ['websocket'],
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
};

export function initializeSocket(httpServer: HttpServer) {
  // Initialize socket server with options
  const io = new Server(httpServer, DEFAULT_OPTIONS);

  // Apply authentication middleware
  io.use(authMiddleware);

  // Handle socket connections
  io.on('connection', async (socket: CustomServerSocket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    try {
      // Initialize handlers
      const handlers = [
        new ChatHandler(socket),
        new PostHandler(socket),
        new MarketplaceHandler(socket)
      ];

      // Set up all handlers
      handlers.forEach(handler => handler.setupHandlers());

      // Store user's rooms for cleanup
      const userRooms = new Set<string>();

      // Handle room joins
      socket.on('join_room', (room: string) => {
        socket.join(room);
        userRooms.add(room);
      });

      // Handle room leaves
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        userRooms.delete(room);
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`Socket disconnected: ${socket.id} (User: ${socket.user.id})`);
        
        // Leave all rooms
        for (const room of userRooms) {
          await socket.leave(room);
        }
        userRooms.clear();
      });

      // Handle errors
      socket.on('error', (error: Error) => {
        console.error(`Socket error (${socket.id}):`, error);
      });

    } catch (error) {
      console.error(`Error initializing socket handlers (${socket.id}):`, error);
      socket.disconnect();
    }
  });

  // Handle server-level errors
  io.on('error', (error: Error) => {
    console.error('Socket server error:', error);
  });

  // Setup periodic cleanup
  setInterval(() => {
    io.sockets.sockets.forEach((socket: CustomServerSocket) => {
      if (!socket.connected) {
        socket.disconnect(true);
      }
    });
  }, 5 * 60 * 1000); // Every 5 minutes

  return io;
}

export default initializeSocket;
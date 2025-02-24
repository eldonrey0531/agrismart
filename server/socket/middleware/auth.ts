import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken } from '../../lib/auth';
import {
  CustomServerSocket,
  SocketUser,
  UserRole,
  AccountLevel,
  SocketJwtPayload
} from '../../../types/socket';

export async function authMiddleware(
  socket: CustomServerSocket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      // Verify and decode token
      const decodedToken = await verifyToken(token);
      
      // Type guard for decoded token
      const isValidPayload = (payload: any): payload is SocketJwtPayload => {
        return (
          typeof payload === 'object' &&
          typeof payload.id === 'string' &&
          typeof payload.role === 'string' &&
          ['ADMIN', 'SELLER', 'USER'].includes(payload.role) &&
          typeof payload.accountLevel === 'string' &&
          ['FREE', 'PREMIUM', 'ENTERPRISE'].includes(payload.accountLevel)
        );
      };

      if (!isValidPayload(decodedToken)) {
        throw new Error('Invalid token payload structure');
      }

      // Set user data in socket
      socket.user = {
        id: decodedToken.id,
        role: decodedToken.role,
        accountLevel: decodedToken.accountLevel,
        isActive: true,
        lastSeen: new Date()
      };

      // Set auth data
      socket.auth = {
        userId: decodedToken.id,
        token
      };

      // Join user's room for private messages
      socket.join(`user:${decodedToken.id}`);

      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Invalid authentication token'));
    }
  } catch (error) {
    console.error('Socket middleware error:', error);
    next(new Error('Authentication failed'));
  }
}

export async function roleGuard(
  socket: CustomServerSocket,
  allowedRoles: UserRole[]
) {
  const { user } = socket;

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error('Unauthorized access');
  }

  return true;
}

export async function levelGuard(
  socket: CustomServerSocket,
  minimumLevel: AccountLevel
) {
  const { user } = socket;
  const levels: Record<AccountLevel, number> = {
    'FREE': 0,
    'PREMIUM': 1,
    'ENTERPRISE': 2
  };

  if (!user || levels[user.accountLevel] < levels[minimumLevel]) {
    throw new Error('Account level not sufficient');
  }

  return true;
}

export function getRoomAccess(socket: CustomServerSocket, roomId: string) {
  const { user } = socket;

  return {
    canRead: async () => {
      // Implement room-specific read access logic
      return true;
    },
    canWrite: async () => {
      // Implement room-specific write access logic
      return true;
    },
    canModerate: async () => {
      return user.role === 'ADMIN' || roomId.startsWith(`user:${user.id}`);
    }
  };
}

export default {
  authMiddleware,
  roleGuard,
  levelGuard,
  getRoomAccess
};
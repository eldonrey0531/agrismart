import { CustomServerSocket, SocketEventHandler, SocketUser } from '../../../types/socket';

export abstract class BaseSocketHandler {
  protected user: SocketUser;

  constructor(protected socket: CustomServerSocket) {
    this.user = socket.user;
  }

  /**
   * Register an event handler with proper type inference
   */
  protected on<T = any>(event: string, handler: SocketEventHandler<T>): void {
    this.socket.on(event, handler);
  }

  /**
   * Emit an event with proper type inference
   */
  protected emit<T = any>(event: string, data: T): void {
    this.socket.emit(event, data);
  }

  /**
   * Broadcast an event to all clients except the sender
   */
  protected broadcast<T = any>(event: string, data: T): void {
    this.socket.broadcast.emit(event, data);
  }

  /**
   * Emit an event to a specific room
   */
  protected emitToRoom<T = any>(room: string, event: string, data: T): void {
    this.socket.to(room).emit(event, data);
  }

  /**
   * Join a room with optional callback
   */
  protected async joinRoom(room: string): Promise<void> {
    await this.socket.join(room);
  }

  /**
   * Leave a room with optional callback
   */
  protected async leaveRoom(room: string): Promise<void> {
    await this.socket.leave(room);
  }

  /**
   * Check if the socket is in a specific room
   */
  protected isInRoom(room: string): boolean {
    return this.socket.rooms.has(room);
  }

  /**
   * Get all rooms the socket is in
   */
  protected getRooms(): Set<string> {
    return this.socket.rooms;
  }

  /**
   * Emit an error event
   */
  protected emitError(code: string, message: string, details?: any): void {
    this.emit('error', {
      code,
      message,
      details
    });
  }

  /**
   * Check if user has required role
   */
  protected hasRole(role: SocketUser['role']): boolean {
    return this.user.role === role;
  }

  /**
   * Check if user has required account level
   */
  protected hasAccountLevel(level: SocketUser['accountLevel']): boolean {
    const levels = {
      FREE: 0,
      PREMIUM: 1,
      ENTERPRISE: 2
    };
    return levels[this.user.accountLevel] >= levels[level];
  }

  /**
   * Get user's room identifier
   */
  protected getUserRoom(): string {
    return `user:${this.user.id}`;
  }

  /**
   * Log handler events with consistent format
   */
  protected log(message: string, data?: any): void {
    console.log(
      `[${this.constructor.name}] ${message}`,
      data ? `\nData: ${JSON.stringify(data, null, 2)}` : ''
    );
  }

  /**
   * Log handler errors with consistent format
   */
  protected logError(message: string, error: any): void {
    console.error(
      `[${this.constructor.name}] ${message}`,
      error
    );
  }

  /**
   * Abstract method that must be implemented by concrete handlers
   */
  abstract setupHandlers(): void;
}
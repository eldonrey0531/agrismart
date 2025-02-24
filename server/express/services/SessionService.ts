import { User } from '../models/User';
import { AuthenticationError } from '../utils/errors';
import { authConfig } from '../config/auth';
import { UserDocument, UserStatus } from '../types/user';

class SessionService {
  private static instance: SessionService;

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Validate user's session by checking various conditions
   */
  async validateSession(userId: string): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    await this.validateUserStatus(user);
    await this.validatePasswordExpiration(user);
    await this.validateSessionExpiration(user);
  }

  /**
   * Check if user's status is valid
   */
  private async validateUserStatus(user: UserDocument): Promise<void> {
    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthenticationError(
        user.statusReason || 'Account is suspended'
      );
    }

    if (user.status === UserStatus.PENDING && authConfig.features.emailVerification) {
      throw new AuthenticationError('Email verification required');
    }
  }

  /**
   * Check if user's password has expired
   */
  private async validatePasswordExpiration(user: UserDocument): Promise<void> {
    if (!authConfig.features.passwordExpiration) {
      return;
    }

    const { expirationDays } = authConfig.passwordPolicy;
    if (!user.lastPasswordReset) {
      return;
    }

    const expirationDate = new Date(user.lastPasswordReset);
    expirationDate.setDate(expirationDate.getDate() + expirationDays);

    if (new Date() > expirationDate) {
      throw new AuthenticationError('Password has expired. Please reset your password.');
    }
  }

  /**
   * Check if the session has expired
   */
  private async validateSessionExpiration(user: UserDocument): Promise<void> {
    if (!user.lastActivity) {
      return;
    }

    const sessionTTL = authConfig.session.ttl * 1000; // Convert to milliseconds
    const expirationTime = new Date(user.lastActivity.getTime() + sessionTTL);

    if (new Date() > expirationTime) {
      throw new AuthenticationError('Session has expired. Please log in again.');
    }
  }

  /**
   * Update user's last activity timestamp
   */
  async updateLastActivity(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastActivity: new Date(),
    });
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(userId: string, sessionId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Remove the specific session
    user.activeSessions = user.activeSessions.filter(s => s.id !== sessionId);
    if (user.currentSessionId === sessionId) {
      user.currentSessionId = undefined;
    }

    await user.save();
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllSessions(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    user.activeSessions = [];
    user.currentSessionId = undefined;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
  }

  /**
   * Check if a session is valid
   */
  async isValidSession(userId: string, sessionId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    return user.activeSessions.some(s => s.id === sessionId);
  }
}

export const sessionService = SessionService.getInstance();
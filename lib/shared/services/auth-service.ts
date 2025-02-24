import { SignJWT, jwtVerify } from 'jose';
import { AuthResponse, JWTPayload, LoginRequest, RegisterRequest, User } from '../types/auth';

export class AuthService {
  private static instance: AuthService;
  private readonly secret: Uint8Array;
  private readonly baseUrl: string;
  private readonly expressUrl: string;

  private constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.secret = new TextEncoder().encode(process.env.JWT_SECRET);
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.expressUrl = process.env.EXPRESS_API_URL || 'http://localhost:5001';
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate JWT token
  async generateToken(user: User): Promise<string> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      status: user.status,
    };

    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(this.secret);
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Login user through Next.js API
  async loginNext(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    return response.json();
  }

  // Login user through Express API
  async loginExpress(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.expressUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    return response.json();
  }

  // Register user (creates account in both systems)
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Register in Next.js API
      const nextResponse = await fetch(`${this.baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const nextResult = await nextResponse.json();

      if (!nextResult.success) {
        return nextResult;
      }

      // Register in Express API
      const expressResponse = await fetch(`${this.expressUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          nextAuthId: nextResult.data.user.id, // Link the accounts
        }),
      });

      const expressResult = await expressResponse.json();

      if (!expressResult.success) {
        // Rollback Next.js registration if Express registration fails
        await fetch(`${this.baseUrl}/api/auth/delete-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: nextResult.data.user.id }),
        });

        return expressResult;
      }

      return nextResult;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete registration',
          details: { error: String(error) },
        },
      };
    }
  }

  // Sync session between Next.js and Express
  async syncSession(token: string): Promise<void> {
    try {
      await fetch(`${this.expressUrl}/auth/sync-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Failed to sync session:', error);
    }
  }

  // Logout from both systems
  async logout(token: string): Promise<void> {
    try {
      await Promise.all([
        fetch(`${this.baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${this.expressUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);
    } catch (error) {
      console.error('Failed to complete logout:', error);
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
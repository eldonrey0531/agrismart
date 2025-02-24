import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../services/auth.service';
import { JwtService } from '../../services/jwt.service';
import { MailService } from '../../services/mail.service';
import { prisma } from '../../lib/prisma';
import { Role, Status, TokenType } from '../../types/enums';
import { ApiError } from '../../types/error';
import { AUTH_CONSTANTS } from '../../constants/auth.constants';

// Mock modules
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    token: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn()
    }
  }
}));

vi.mock('../../services/jwt.service', () => ({
  JwtService: {
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    generateVerificationToken: vi.fn(),
    isValidTokenType: vi.fn(),
    extractUserId: vi.fn()
  }
}));

vi.mock('../../services/mail.service', () => ({
  MailService: {
    sendVerificationEmail: vi.fn()
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User'
    };

    const mockUser = {
      id: '1',
      email: registerData.email,
      name: registerData.name,
      role: Role.USER,
      status: Status.PENDING,
      password: 'hashed_password',
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should successfully register a new user', async () => {
      // Setup mocks
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (JwtService.generateVerificationToken as jest.Mock).mockReturnValue('verification_token');
      (prisma.token.create as jest.Mock).mockResolvedValue({ 
        id: '1',
        token: 'verification_token',
        type: TokenType.VERIFICATION,
        userId: mockUser.id,
        expiresAt: new Date(),
        createdAt: new Date()
      });
      (MailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await AuthService.register(registerData);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        status: mockUser.status
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email.toLowerCase() }
      });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
      expect(JwtService.generateVerificationToken).toHaveBeenCalled();
      expect(MailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(AuthService.register(registerData))
        .rejects
      status: Status.ACTIVE,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should successfully log in a user', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      vi.spyOn(JwtService, 'generateAccessToken').mockReturnValue('access_token');
      vi.spyOn(JwtService, 'generateRefreshToken').mockReturnValue('refresh_token');
      vi.spyOn(prisma.token, 'create').mockResolvedValue({ 
        id: '1',
        token: 'refresh_token',
        type: TokenType.REFRESH,
        userId: mockUser.id,
        expiresAt: new Date(),
        createdAt: new Date()
      });

      const result = await AuthService.login(loginData);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          status: mockUser.status
        },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });
    });

    it('should throw error for invalid credentials', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(AuthService.login(loginData))
        .rejects
        .toThrow(AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
    });

    it('should throw error for unverified email', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        emailVerified: null
      });
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(AuthService.login(loginData))
        .rejects
        .toThrow(AUTH_CONSTANTS.ERRORS.ACCOUNT_NOT_VERIFIED);
    });

    it('should throw error for inactive account', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        status: Status.SUSPENDED
      });
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(AuthService.login(loginData))
        .rejects
        .toThrow(AUTH_CONSTANTS.ERRORS.ACCOUNT_INACTIVE);
    });
  });
});      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should successfully log in a user', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      vi.spyOn(JwtService, 'generateAccessToken').mockReturnValue('access_token');
      vi.spyOn(JwtService, 'generateRefreshToken').mockReturnValue('refresh_token');
      vi.spyOn(prisma.token, 'create').mockResolvedValue({ 
        id: '1',
        token: 'refresh_token',
        type: TokenType.REFRESH,
        userId: mockUser.id,
        expiresAt: new Date(),
        createdAt: new Date()
      });

      const result = await AuthService.login(loginData);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          status: mockUser.status
        },
        accessToken: 'access_token',
        refreshToken: 'refresh_token'
      });
    });

    it('should throw error for invalid credentials', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(AuthService.login(loginData))
        .rejects
        .toThrow(AUTH_CONSTANTS.ERRORS.INVALID_CREDENTIALS);
    });

    it('should throw error for unverified email', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        emailVerified: null
      });
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(AuthService.login(loginData))
        .rejects
        .toThrow(AUTH_CONSTANTS.ERRORS.ACCOUNT_NOT_VERIFIED);
    });

    it('should throw error for inactive account', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        ...mockUser,
        status: Status.SUSPENDED
      });
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(AuthService.login(loginData))
        .rejects
        .toThrow(AUTH_CONSTANTS.ERRORS.ACCOUNT_INACTIVE);
    });
  });
});
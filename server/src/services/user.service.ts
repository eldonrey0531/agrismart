import { PrismaClient, User, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { redis } from '../lib/redis';
import { throwHttpError } from '../lib/http-errors';
import { appConfig } from '../config/app.config';

const prisma = new PrismaClient();

interface ProfileUpdateData {
  name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
}

interface SettingsUpdateData {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

interface NotificationPreferences {
  marketing: boolean;
  orderUpdates: boolean;
  messages: boolean;
  security: boolean;
}

interface SellerData {
  businessName: string;
  businessType: string;
  taxId: string;
  address: string;
  phoneNumber: string;
}

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throwHttpError.notFound('User not found');
    }

    return user;
  }

  static async updateProfile(userId: string, data: ProfileUpdateData) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        phoneNumber: true
      }
    });
  }

  static async getSettings(userId: string) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      throwHttpError.notFound('Settings not found');
    }

    return settings;
  }

  static async updateSettings(userId: string, data: SettingsUpdateData) {
    return prisma.userSettings.upsert({
      where: { userId },
      create: { ...data, userId },
      update: data
    });
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throwHttpError.notFound('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throwHttpError.badRequest('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, appConfig.security.bcryptRounds);
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  static async setup2FA(userId: string) {
    // TODO: Implement actual 2FA setup
    return { secret: 'mock-2fa-secret' };
  }

  static async verify2FA(userId: string, token: string) {
    // TODO: Implement actual 2FA verification
    return true;
  }

  static async disable2FA(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false }
    });
  }

  static async getNotificationPreferences(userId: string) {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId }
    });

    if (!prefs) {
      throwHttpError.notFound('Notification preferences not found');
    }

    return prefs;
  }

  static async updateNotificationPreferences(userId: string, data: NotificationPreferences) {
    return prisma.notificationPreferences.upsert({
      where: { userId },
      create: { ...data, userId },
      update: data
    });
  }

  static async getActiveSessions(userId: string) {
    const sessions = await redis.keys(`session:${userId}:*`);
    return Promise.all(
      sessions.map(async (key) => {
        const session = await redis.get(key);
        return session ? JSON.parse(session) : null;
      })
    );
  }

  static async revokeSession(userId: string, sessionId: string) {
    await redis.del(`session:${userId}:${sessionId}`);
  }

  static async revokeAllSessions(userId: string) {
    const sessions = await redis.keys(`session:${userId}:*`);
    await Promise.all(sessions.map((key) => redis.del(key)));
  }

  static async upgradeToSeller(userId: string, data: SellerData) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        role: 'SELLER',
        seller: {
          create: data
        }
      },
      include: {
        seller: true
      }
    });
  }

  static async getSellerStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        seller: true
      }
    });

    if (!user) {
      throwHttpError.notFound('User not found');
    }

    return {
      isSeller: user.role === 'SELLER',
      sellerDetails: user.seller
    };
  }

  static async exportAccountData(userId: string) {
    const [user, settings, notifications, orders, products] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.notificationPreferences.findUnique({ where: { userId } }),
      prisma.order.findMany({ where: { buyerId: userId } }),
      prisma.product.findMany({ where: { sellerId: userId } })
    ]);

    return {
      profile: user,
      settings,
      notifications,
      orders,
      products
    };
  }

  static async deactivateAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throwHttpError.notFound('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throwHttpError.badRequest('Invalid password');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  }

  static async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throwHttpError.notFound('User not found');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throwHttpError.badRequest('Invalid password');
    }

    await prisma.$transaction([
      prisma.notificationPreferences.delete({ where: { userId } }),
      prisma.userSettings.delete({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);
  }
}

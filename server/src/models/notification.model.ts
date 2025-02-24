import { Notification } from '@/types';
import { prisma } from '@/config/db.config';

export class NotificationModel {
  static async create(data: Omit<Notification, 'id'>): Promise<Notification> {
    return prisma.notification.create({ data });
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }
}

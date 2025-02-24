import { NotificationModel } from '../models/notification.model';
import { Notification } from '@/types';

export class NotificationsService {
  static async createNotification(data: Omit<Notification, 'id'>): Promise<Notification> {
    return NotificationModel.create(data);
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    return NotificationModel.getUserNotifications(userId);
  }

  static async markAsRead(notificationId: string): Promise<Notification> {
    return NotificationModel.markAsRead(notificationId);
  }
}

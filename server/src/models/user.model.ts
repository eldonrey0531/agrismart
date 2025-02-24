import { User, UserProfile } from '@/types';
import { prisma } from '@/config/db.config';

export class UserModel {
  static async create(data: Omit<User, 'id'>): Promise<User> {
    return prisma.user.create({ data });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async updateProfile(userId: string, data: Partial<UserProfile>): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { profile: { update: data } }
    });
  }

  static async updateRoles(userId: string, roles: string[]): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { roles }
    });
  }
}

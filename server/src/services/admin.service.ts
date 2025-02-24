import { UserModel } from '../models/user.model';
import { User } from '@/types';

export class AdminService {
  static async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  static async setUserRoles(userId: string, roles: string[]): Promise<User> {
    return UserModel.updateRoles(userId, roles);
  }

  static async deleteUser(userId: string): Promise<User> {
    return prisma.user.delete({ where: { id: userId } });
  }
}

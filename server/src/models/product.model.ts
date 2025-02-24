import { Product } from '@/types';
import { prisma } from '@/config/db.config';

export class ProductModel {
  static async create(data: Omit<Product, 'id'>): Promise<Product> {
    return prisma.product.create({ data });
  }

  static async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  static async findBySeller(sellerId: string): Promise<Product[]> {
    return prisma.product.findMany({ where: { sellerId } });
  }

  static async update(id: string, data: Partial<Product>): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }
}

import { PrismaClient, Product, Category, Review } from '@prisma/client';
import { throwError } from '../lib/errors';
import { redis } from '../lib/redis';
import { storage } from '../lib/storage';
import { log } from '../utils/logger';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { FileWithUrl } from '../types/express-extension';

const prisma = new PrismaClient();

type ProductQuery = {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

export class ProductService {
  static async listProducts(query: ProductQuery) {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where = {
      ...(category && { category }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
      isActive: true
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              rating: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async searchProducts(query: ProductQuery) {
    const { search = '', page = 1, limit = 10 } = query;

    const cacheKey = `search:${search}:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ],
      isActive: true
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { _relevance: { fields: ['title', 'description'], search, sort: 'desc' } },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              rating: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    const result = {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 900); // 15 minutes cache

    return result;
  }

  static async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            rating: true
          }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      throwError.notFound('Product not found');
    }

    return product;
  }

  static async createProduct(data: Partial<Product> & { sellerId: string }) {
    return prisma.product.create({
      data: {
        ...data,
        seller: { connect: { id: data.sellerId } }
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async updateProduct(id: string, sellerId: string, data: Partial<Product>) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throwError.notFound('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throwError.forbidden('Not authorized to update this product');
    }

    return prisma.product.update({
      where: { id },
      data,
      include: {
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async deleteProduct(id: string, sellerId: string) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throwError.notFound('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throwError.forbidden('Not authorized to delete this product');
    }

    // Delete product images from storage
    if (product.images?.length) {
      await Promise.all(
        product.images.map(image => storage.deleteFile(image))
      );
    }

    await prisma.product.delete({ where: { id } });
  }

  static async listCategories() {
    const cacheKey = 'categories:list';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    await redis.set(cacheKey, JSON.stringify(categories), 'EX', 3600); // 1 hour cache
    return categories;
  }

  static async addReview(productId: string, userId: string, data: Partial<Review>) {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throwError.notFound('Product not found');
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId
      }
    });

    if (existingReview) {
      throwError.conflict('You have already reviewed this product');
    }

    return prisma.review.create({
      data: {
        ...data,
        product: { connect: { id: productId } },
        user: { connect: { id: userId } }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async getProductStats(userId: string) {
    const stats = await prisma.$transaction([
      prisma.product.count({
        where: { sellerId: userId }
      }),
      prisma.product.count({
        where: {
          sellerId: userId,
          stock: { gt: 0 }
        }
      }),
      prisma.order.count({
        where: {
          product: { sellerId: userId }
        }
      }),
      prisma.review.aggregate({
        where: {
          product: { sellerId: userId }
        },
        _avg: {
          rating: true
        }
      })
    ]);

    return {
      totalProducts: stats[0],
      activeProducts: stats[1],
      totalOrders: stats[2],
      averageRating: stats[3]._avg.rating || 0
    };
  }

  // Additional methods for bulk operations and other functionalities...
}
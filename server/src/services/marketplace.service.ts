import { PrismaClient } from '@prisma/client';
import { redis } from '../lib/redis';
import { throwError } from '../lib/errors';
import { 
  ProductWithSeller,
  CategoryResponse,
  TrendingProducts,
  CategoryStats,
  MarketplaceStats,
  SearchParams
} from '../types/marketplace';
import { log } from '../utils/logger';

const prisma = new PrismaClient();

const CACHE_TTL = {
  FEATURED: 3600,     // 1 hour
  CATEGORIES: 86400,  // 24 hours
  TRENDING: 900,      // 15 minutes
  SEARCH: 300,        // 5 minutes
  SELLER: 1800,      // 30 minutes
  FILTERS: 1800      // 30 minutes
};

export class MarketplaceService {
  static async getFeaturedProducts(): Promise<ProductWithSeller[]> {
    const cacheKey = 'featured:products';
    const cached = await redis.get<ProductWithSeller[]>(cacheKey);
    if (cached) return cached;

    const featured = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            rating: true
          }
        }
      },
      take: 10
    });

    await redis.set(cacheKey, featured, CACHE_TTL.FEATURED);
    return featured;
  }

  static async getCategories(): Promise<CategoryResponse> {
    const cacheKey = 'marketplace:categories';
    const cached = await redis.get<CategoryResponse>(cacheKey);
    if (cached) return cached;

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            _count: {
              select: { products: true }
            }
          }
        }
      }
    });

    const response = {
      categories,
      total: categories.length,
      topLevel: categories.filter(c => !c.parent),
      hasChildren: categories.filter(c => c.children.length > 0)
    };

    await redis.set(cacheKey, response, CACHE_TTL.CATEGORIES);
    return response;
  }

  static async getSubcategories(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: {
          include: {
            _count: {
              select: { products: true }
            }
          }
        }
      }
    });

    if (!category) {
      throwError.notFound('Category not found');
    }

    return category.children;
  }

  static async getTrendingProducts(): Promise<TrendingProducts> {
    const cacheKey = 'trending:products';
    const cached = await redis.get<TrendingProducts>(cacheKey);
    if (cached) return cached;

    const [topViewed, topRated, recentSales] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          views: { gt: 100 }
        },
        orderBy: { views: 'desc' },
        take: 10,
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
      prisma.product.findMany({
        where: {
          isActive: true,
          rating: { gt: 4 }
        },
        orderBy: { rating: 'desc' },
        take: 10,
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
      prisma.product.findMany({
        where: {
          isActive: true,
          orders: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        },
        take: 10,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              rating: true
            }
          }
        }
      })
    ]);

    const trending = {
      topViewed,
      topRated,
      recentSales,
      featured: topViewed.slice(0, 5)
    };

    await redis.set(cacheKey, trending, CACHE_TTL.TRENDING);
    return trending;
  }

  static async getAvailableFilters(category?: string) {
    const cacheKey = `filters:${category || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const where = category ? { category } : {};

    const [priceRange, brands, ratings] = await Promise.all([
      prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true }
      }),
      prisma.product.groupBy({
        where,
        by: ['brand'],
        _count: true
      }),
      prisma.product.groupBy({
        where,
        by: ['rating'],
        _count: true
      })
    ]);

    const filters = {
      priceRange: {
        min: priceRange._min.price,
        max: priceRange._max.price
      },
      brands: brands.map(b => ({
        name: b.brand,
        count: b._count
      })),
      ratings: ratings.map(r => ({
        value: r.rating,
        count: r._count
      }))
    };

    await redis.set(cacheKey, JSON.stringify(filters), CACHE_TTL.FILTERS);
    return filters;
  }

  static async getCategoryProducts(categoryId: string, query: any) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throwError.notFound('Category not found');
    }

    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where = {
      categoryId,
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

  // ... rest of the methods remain the same ...

  private static async validateSeller(sellerId: string): Promise<void> {
    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: 'SELLER' }
    });

    if (!seller) {
      throwError.notFound('Seller not found');
    }
  }

  private static async invalidateCache(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}

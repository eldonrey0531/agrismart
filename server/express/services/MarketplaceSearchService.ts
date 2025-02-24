import { redis } from '../utils/redis';
import { prisma, Prisma } from '../utils/prisma';
import type { 
  ProductResponse, 
  SearchResponse, 
  SearchFacets,
  PriceRange,
  CategoryFacet,
  SellerFacet,
  ProductQuery
} from '../types/marketplace';

const PRICE_RANGES = [
  { min: 0, max: 100 },
  { min: 100, max: 500 },
  { min: 500, max: 1000 },
  { min: 1000, max: 5000 },
  { min: 5000, max: 10000 },
  { min: 10000, max: Infinity }
];

const CACHE_TTL = 60 * 5; // 5 minutes
const CACHE_PREFIX = 'search:';

export class MarketplaceSearchService {
  /**
   * Search products with facets
   */
  static async search(query: ProductQuery): Promise<SearchResponse> {
    const cacheKey = this.generateCacheKey(query);
    
    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build where conditions
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.sellerId) {
      where.sellerId = query.sellerId;
    }

    if (query.condition && query.condition !== 'all') {
      where.condition = query.condition;
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = query.minPrice;
      if (query.maxPrice) where.price.lte = query.maxPrice;
    }

    // Handle location-based search
    if (query.location) {
      const { latitude, longitude, radius = 10000 } = query.location;
      const sql = Prisma.sql`
        WITH LocationFiltered AS (
          SELECT 
            *,
            ST_Distance(
              location::geometry,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
            ) as distance
          FROM "Product"
          WHERE ST_DWithin(
            location::geometry,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
            ${radius}
          )
        )
        SELECT 
          p.*,
          c.id as "categoryId",
          c.name as "categoryName",
          u.id as "sellerId",
          u.name as "sellerName",
          p.distance
        FROM LocationFiltered p
        LEFT JOIN "Category" c ON c.id = p."categoryId"
        LEFT JOIN "User" u ON u.id = p."sellerId"
        ORDER BY p.distance
        LIMIT ${query.pageSize || 20}
        OFFSET ${((query.page || 1) - 1) * (query.pageSize || 20)}
      `;

      const countSql = Prisma.sql`
        SELECT COUNT(*) as total
        FROM "Product"
        WHERE ST_DWithin(
          location::geometry,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
          ${radius}
        )
      `;

      const [products, [{ total }]] = await Promise.all([
        prisma.$queryRaw<any[]>(sql),
        prisma.$queryRaw<[{ total: string }]>(countSql)
      ]);

      const result: SearchResponse = {
        items: this.mapProducts(products),
        total: parseInt(total, 10),
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        facets: await this.getFacets(where)
      };

      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
      return result;
    }

    // Regular search without location
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        include: {
          category: true,
          seller: true
        },
        orderBy: this.getOrderBy(query.sortBy, query.sortOrder)
      }),
      prisma.product.count({ where })
    ]);

    const result: SearchResponse = {
      items: this.mapProducts(products),
      total,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      facets: await this.getFacets(where)
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  /**
   * Get faceted search results
   */
  private static async getFacets(where: Prisma.ProductWhereInput): Promise<SearchFacets> {
    const categories = await prisma.$queryRaw<Array<{ id: string; name: string; count: string }>>`
      SELECT c.id, c.name, COUNT(p.id) as count
      FROM "Category" c
      LEFT JOIN "Product" p ON p."categoryId" = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `;

    const prices = await prisma.$queryRaw<Array<{ price: number; count: string }>>`
      SELECT price, COUNT(*) as count
      FROM "Product"
      GROUP BY price
    `;

    const sellers = await prisma.$queryRaw<Array<{ id: string; name: string; count: string }>>`
      SELECT u.id, u.name, COUNT(p.id) as count
      FROM "User" u
      LEFT JOIN "Product" p ON p."sellerId" = u.id
      GROUP BY u.id, u.name
      ORDER BY count DESC
      LIMIT 10
    `;

    return {
      categories: categories.map(c => ({
        id: c.id,
        name: c.name || 'Unknown',
        count: parseInt(c.count, 10)
      })),
      priceRanges: PRICE_RANGES.map(range => ({
        min: range.min,
        max: range.max,
        count: prices
          .filter(p => p.price >= range.min && p.price < range.max)
          .reduce((sum, p) => sum + parseInt(p.count, 10), 0)
      })),
      sellers: sellers.map(s => ({
        id: s.id,
        name: s.name || 'Unknown',
        count: parseInt(s.count, 10)
      }))
    };
  }

  /**
   * Get order by clause
   */
  private static getOrderBy(
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Prisma.Enumerable<Prisma.ProductOrderByWithRelationInput> {
    switch (sortBy) {
      case 'price':
        return { price: sortOrder };
      case 'date':
        return { createdAt: sortOrder };
      default:
        return { createdAt: 'desc' };
    }
  }

  /**
   * Map raw database results to response type
   */
  private static mapProducts(products: any[]): ProductResponse[] {
    return products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      categoryId: p.categoryId,
      sellerId: p.sellerId,
      condition: p.condition,
      images: p.images || [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      category: {
        id: p.categoryId,
        name: p.categoryName || (p.category?.name || 'Unknown')
      },
      seller: {
        id: p.sellerId,
        name: p.sellerName || (p.seller?.name || 'Unknown')
      },
      distance: p.distance ? Math.round(p.distance) : undefined
    }));
  }

  /**
   * Generate cache key from query
   */
  private static generateCacheKey(query: ProductQuery): string {
    return `${CACHE_PREFIX}${JSON.stringify(query)}`;
  }

  /**
   * Clear search cache
   */
  static async clearCache(): Promise<void> {
    const keys = await redis.scan(`${CACHE_PREFIX}*`);
    if (keys.length) {
      await redis.del(...keys);
    }
  }
}
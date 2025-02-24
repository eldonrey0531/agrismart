import { Socket } from 'socket.io';
import { Prisma, Product } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { SocketUser } from '../../../types/socket';
import {
  MarketplaceEvent,
  MarketplaceFilterOptions,
  CreateProductData,
  UpdateProductData,
  MarketplaceProduct,
  MarketplaceResponse,
  MarketplaceErrorResponse,
  MarketplaceSearchResult,
  RequiredMarketplaceFilterOptions
} from '../../../shared/types/marketplace';
import {
  AttributesJson,
  AttributeType,
  DEFAULT_PRODUCT_DATA,
  MarketplaceAttribute,
  MarketplaceProductAttribute
} from '../../../shared/types/marketplace-data';

/** Base product attributes */
interface ProductAttribute {
  name: string;
  value: string;
  type: AttributeType;
}

/** Common product fields */
interface BaseProduct {
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isDigital: boolean;
  attributes: ProductAttribute[];
}

/** Input type for creating products */
interface CreateProductInput extends BaseProduct {
  categoryIds: string[];
}

/** Input type for updating products */
interface UpdateProductInput extends Partial<BaseProduct> {
  categoryIds?: string[];
}

// Define the type for product with relations
type ProductWithRelations = Product & {
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

/**
 * Handles marketplace operations with proper validation and error handling
 */
export class MarketplaceHandler {
  // Validation constants
  private static readonly DEFAULT_PAGE_SIZE = 20;
  private static readonly MIN_PAGE_SIZE = 1;
  private static readonly MAX_PAGE_SIZE = 100;
  private static readonly MIN_RATING = 0;
  private static readonly MAX_RATING = 5;

  // Error codes
  private static readonly ErrorCodes = {
    // Validation errors
    INVALID_INPUT: 'INVALID_INPUT',
    INVALID_FILTERS: 'INVALID_FILTERS',
    INVALID_PRODUCT: 'INVALID_PRODUCT',
    
    // Authorization errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    
    // Resource errors
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    
    // Operation errors
    CREATE_ERROR: 'CREATE_ERROR',
    UPDATE_ERROR: 'UPDATE_ERROR',
    DELETE_ERROR: 'DELETE_ERROR',
    SEARCH_ERROR: 'SEARCH_ERROR',
    
    // System errors
    TRANSACTION_ERROR: 'TRANSACTION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  } as const;

  // Sort options
  private static readonly SORT_OPTIONS = {
    price_asc: { price: 'asc' as const },
    price_desc: { price: 'desc' as const },
    rating_desc: { rating: 'desc' as const },
    views_desc: { views: 'desc' as const },
    created_desc: { createdAt: 'desc' as const }
  } as const;

  constructor(private socket: Socket & { user: SocketUser }) {}

  private isValidAttributeType(type: string): type is AttributeType {
    return Object.values(AttributeType).includes(type as AttributeType);
  }

  private mapToMarketplaceProduct(data: ProductWithRelations): MarketplaceProduct {
    const attributesJson = (data.attributes as AttributesJson) || {};
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      isDigital: data.isDigital,
      rating: data.rating,
      views: data.views,
      images: data.images,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      seller: {
        id: data.seller.id,
        name: data.seller.name,
        rating: data.seller.rating
      },
      categories: data.categories.map(cp => cp.category),
      attributes: Object.entries(attributesJson).map(([name, attr]): MarketplaceProductAttribute => ({
        id: name,
        name,
        value: attr.value,
        type: attr.type
      }))
    };
  }

  private async broadcastUpdate(event: MarketplaceEvent, payload: MarketplaceProduct) {
    switch (event) {
      case MarketplaceEvent.PRODUCT_CREATE:
        this.socket.broadcast.emit(event, { success: true, data: payload });
        break;
      case MarketplaceEvent.PRODUCT_UPDATE:
      case MarketplaceEvent.PRODUCT_DELETE:
        this.socket.to(`product:${payload.id}`).emit(event, { success: true, data: payload });
        break;
      case MarketplaceEvent.CATEGORY_UPDATE:
      case MarketplaceEvent.CATEGORY_DELETE:
        this.socket.to(`category:${payload.id}`).emit(event, { success: true, data: payload });
        break;
      default:
        this.socket.broadcast.emit(event, { success: true, data: payload });
    }
  }

  private validateCreateInput(data: unknown): data is CreateProductInput {
    if (!data || typeof data !== 'object') return false;
    const d = data as CreateProductInput;
    
    return (
      typeof d.title === 'string' &&
      typeof d.description === 'string' &&
      typeof d.price === 'number' &&
      typeof d.stock === 'number' &&
      Array.isArray(d.images) &&
      typeof d.isDigital === 'boolean' &&
      Array.isArray(d.categoryIds) &&
      Array.isArray(d.attributes) &&
      d.attributes.every(attr =>
        typeof attr.name === 'string' &&
        typeof attr.value === 'string' &&
        this.isValidAttributeType(attr.type)
      )
    );
  }

  private validateUpdateInput(rawInput: unknown): rawInput is { id: string; data: UpdateProductInput } {
    if (!rawInput || typeof rawInput !== 'object') return false;
    const input = rawInput as { id: string; data: UpdateProductInput };
    
    return (
      typeof input.id === 'string' &&
      typeof input.data === 'object' &&
      (!input.data.title || typeof input.data.title === 'string') &&
      (!input.data.description || typeof input.data.description === 'string') &&
      (!input.data.price || typeof input.data.price === 'number') &&
      (!input.data.stock || typeof input.data.stock === 'number') &&
      (!input.data.images || Array.isArray(input.data.images)) &&
      (!input.data.isDigital || typeof input.data.isDigital === 'boolean') &&
      (!input.data.categoryIds || Array.isArray(input.data.categoryIds)) &&
      (!input.data.attributes || (Array.isArray(input.data.attributes) &&
        input.data.attributes.every(attr =>
          typeof attr.name === 'string' &&
          typeof attr.value === 'string' &&
          this.isValidAttributeType(attr.type)
        )))
    );
  }

  private validateSearchFilters(filters: unknown): filters is MarketplaceFilterOptions {
    if (!filters || typeof filters !== 'object') return false;
    const f = filters as Partial<MarketplaceFilterOptions>;

    return (
      (!f.categoryIds || Array.isArray(f.categoryIds)) &&
      (!f.priceRange || (
        typeof f.priceRange === 'object' &&
        typeof f.priceRange.min === 'number' &&
        typeof f.priceRange.max === 'number'
      )) &&
      (!f.attributes || (
        typeof f.attributes === 'object' &&
        Object.values(f.attributes).every(arr => Array.isArray(arr))
      )) &&
      (!f.rating || typeof f.rating === 'number') &&
      (!f.isFeatured || typeof f.isFeatured === 'boolean') &&
      (!f.query || typeof f.query === 'string') &&
      (!f.page || typeof f.page === 'number') &&
      (!f.pageSize || typeof f.pageSize === 'number') &&
      (!f.sortBy || Object.keys(MarketplaceHandler.SORT_OPTIONS).includes(f.sortBy))
    );
  }

  private normalizeSearchFilters(filters: MarketplaceFilterOptions): RequiredMarketplaceFilterOptions {
    return {
      categoryIds: filters.categoryIds || [],
      priceRange: filters.priceRange,
      attributes: filters.attributes || {},
      rating: filters.rating,
      isFeatured: filters.isFeatured,
      query: filters.query || '',
      page: Math.max(0, filters.page || 0),
      pageSize: Math.min(
        Math.max(MarketplaceHandler.MIN_PAGE_SIZE, filters.pageSize || MarketplaceHandler.DEFAULT_PAGE_SIZE),
        MarketplaceHandler.MAX_PAGE_SIZE
      ),
      sortBy: Object.keys(MarketplaceHandler.SORT_OPTIONS).includes(filters.sortBy || '')
        ? filters.sortBy
        : 'created_desc'
    };
  }

  private buildSearchQuery(filters: RequiredMarketplaceFilterOptions): Prisma.ProductWhereInput {
    return {
      isActive: true,
      ...(filters.categoryIds.length ? {
        categories: {
          some: {
            categoryId: { in: filters.categoryIds }
          }
        }
      } : {}),
      ...(filters.priceRange ? {
        price: {
          gte: filters.priceRange.min,
          lte: filters.priceRange.max
        }
      } : {}),
      ...(filters.attributes ? {
        attributes: {
          path: Object.keys(filters.attributes).map(key => `$.${key}.value`),
          array_contains: Object.values(filters.attributes).flat()
        }
      } : {}),
      ...(filters.rating ? {
        rating: {
          gte: Math.min(
            Math.max(MarketplaceHandler.MIN_RATING, filters.rating),
            MarketplaceHandler.MAX_RATING
          )
        }
      } : {}),
      ...(filters.isFeatured !== undefined ? {
        isFeatured: filters.isFeatured
      } : {}),
      ...(filters.query ? {
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } }
        ]
      } : {})
    };
  }

  private async updateProductCategories(
    tx: Prisma.TransactionClient,
    productId: string,
    categoryIds: string[]
  ): Promise<void> {
    await tx.categoryProduct.deleteMany({
      where: { productId }
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        categories: {
          create: categoryIds.map(categoryId => ({
            assignedAt: new Date(),
            category: {
              connect: { id: categoryId }
            }
          }))
        }
      }
    });
  }

  private async validateAndAuthorize(entityType: 'create' | 'update', input?: { sellerId?: string }): Promise<void> {
    if (
      this.socket.user.role !== 'ADMIN' &&
      (this.socket.user.role !== 'SELLER' ||
        (entityType === 'update' && input?.sellerId !== this.socket.user.id))
    ) {
      throw new Error(`Unauthorized to ${entityType} products`);
    }
  }

  private async handleTransaction<T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => operation(tx));
  }

  private emitError(error: unknown, code: keyof typeof MarketplaceHandler.ErrorCodes) {
    console.error(`Marketplace ${code.toLowerCase()} error:`, error);
    this.socket.emit(MarketplaceEvent.ERROR, {
      success: false,
      message: error instanceof Error ? error.message : `Operation failed: ${code}`,
      code: MarketplaceHandler.ErrorCodes[code]
    } satisfies MarketplaceErrorResponse);
  }

  private convertAttributesToJson(attributes: ProductAttribute[]): AttributesJson {
    return attributes.reduce<AttributesJson>((acc, attr) => ({
      ...acc,
      [attr.name]: {
        value: attr.value,
        type: attr.type
      }
    }), {});
  }

  async handleSearch(rawFilters: unknown): Promise<void> {
    try {
      if (!this.validateSearchFilters(rawFilters)) {
        throw new Error('Invalid search filters');
      }

      const filters = this.normalizeSearchFilters(rawFilters as MarketplaceFilterOptions);
      const query = this.buildSearchQuery(filters);
      
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where: query,
          orderBy: MarketplaceHandler.SORT_OPTIONS[filters.sortBy],
          skip: filters.page * filters.pageSize,
          take: filters.pageSize,
          include: {
            seller: true,
            categories: {
              include: {
                category: true
              }
            }
          }
        }),
        prisma.product.count({ where: query })
      ]);

      const searchResult: MarketplaceSearchResult = {
        items: items.map(item => this.mapToMarketplaceProduct(item as ProductWithRelations)),
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        hasMore: (filters.page + 1) * filters.pageSize < total
      };

      this.socket.emit(
        MarketplaceEvent.SEARCH_RESULT,
        { success: true, data: searchResult }
      );

    } catch (error) {
      this.emitError(error, 'SEARCH_ERROR');
    }
  }

  async handleCreateProduct(rawData: unknown): Promise<void> {
    try {
      if (!this.validateCreateInput(rawData)) {
        throw new Error('Invalid input data');
      }

      await this.validateAndAuthorize('create');
      const data = rawData as CreateProductInput;
      
      const product = await this.handleTransaction(async (tx) => {
        const createData = {
          ...DEFAULT_PRODUCT_DATA,
          title: data.title,
          description: data.description,
          price: data.price,
          stock: data.stock,
          images: data.images,
          isDigital: data.isDigital,
          attributes: this.convertAttributesToJson(data.attributes),
          seller: {
            connect: { id: this.socket.user.id }
          }
        };

        const newProduct = await tx.product.create({
          data: createData,
          include: {
            seller: true,
            categories: {
              include: {
                category: true
              }
            }
          }
        });

        await this.updateProductCategories(tx, newProduct.id, data.categoryIds);
        
        return await tx.product.findUniqueOrThrow({
          where: { id: newProduct.id },
          include: {
            seller: true,
            categories: {
              include: {
                category: true
              }
            }
          }
        });
      });

      const mappedProduct = this.mapToMarketplaceProduct(product as ProductWithRelations);
      await this.broadcastUpdate(MarketplaceEvent.PRODUCT_CREATE, mappedProduct);
      
      this.socket.emit(
        MarketplaceEvent.PRODUCT_CREATE,
        { success: true, data: mappedProduct }
      );

    } catch (error) {
      this.emitError(error, 'CREATE_ERROR');
    }
  }

  async handleUpdateProduct(rawInput: unknown): Promise<void> {
    try {
      if (!this.validateUpdateInput(rawInput)) {
        throw new Error('Invalid update data');
      }

      const { id, data } = rawInput as { id: string; data: UpdateProductInput };

      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { sellerId: true }
      });

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      await this.validateAndAuthorize('update', { sellerId: existingProduct.sellerId });

      const updated = await this.handleTransaction(async (tx) => {
        const updateData = {
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.price && { price: data.price }),
          ...(data.stock !== undefined && { stock: data.stock }),
          ...(data.images && { images: data.images }),
          ...(typeof data.isDigital === 'boolean' && { isDigital: data.isDigital }),
          ...(data.attributes && {
            attributes: this.convertAttributesToJson(data.attributes)
          })
        };

        const updatedProduct = await tx.product.update({
          where: { id },
          data: updateData,
          include: {
            seller: true,
            categories: {
              include: {
                category: true
              }
            }
          }
        });

        if (data.categoryIds?.length) {
          await this.updateProductCategories(tx, id, data.categoryIds);
          return await tx.product.findUniqueOrThrow({
            where: { id },
            include: {
              seller: true,
              categories: {
                include: {
                  category: true
                }
              }
            }
          });
        }

        return updatedProduct;
      });

      const mappedProduct = this.mapToMarketplaceProduct(updated as ProductWithRelations);
      await this.broadcastUpdate(MarketplaceEvent.PRODUCT_UPDATE, mappedProduct);
      
      this.socket.emit(
        MarketplaceEvent.PRODUCT_UPDATE,
        { success: true, data: mappedProduct }
      );

    } catch (error) {
      this.emitError(error, 'UPDATE_ERROR');
    }
  }

  setupHandlers(): void {
    this.socket.on(MarketplaceEvent.SEARCH, this.handleSearch.bind(this));
    this.socket.on(MarketplaceEvent.PRODUCT_CREATE, this.handleCreateProduct.bind(this));
    this.socket.on(MarketplaceEvent.PRODUCT_UPDATE, this.handleUpdateProduct.bind(this));
  }
}

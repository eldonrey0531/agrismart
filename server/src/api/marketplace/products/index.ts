import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/lib/api-response';
import { withRoleCheck } from '@/lib/auth/api-auth';
import { ApiError } from '@/lib/error';
import type { UserRole } from '@/lib/auth/roles';
import type { ProductCreateInput, ProductUpdateInput, ProductWithSeller } from '@/types/marketplace';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Product validation schema
const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).optional(),
});

/**
 * GET /api/marketplace/products
 * List products with role-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    const handler = await withRoleCheck(async ({ userId, role }) => {
      // Apply role-based filters
      const where: Prisma.ProductWhereInput = {
        status: role === 'admin' ? undefined : 'active',
        deletedAt: null,
      };
      
      if (role === 'seller') {
        where.sellerId = userId;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where })
      ]);

      return ApiResponse.success({
        products,
        total,
        page: 1,
        limit: products.length
      });
    }, ['guest', 'buyer', 'seller', 'admin']);

    return handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.toResponse());
    }
    return ApiResponse.error('Failed to fetch products');
  }
}

/**
 * POST /api/marketplace/products
 * Create new product (sellers only)
 */
export async function POST(request: NextRequest) {
  try {
    const handler = await withRoleCheck(async ({ userId, role }) => {
      const data = await request.json();
      
      try {
        const validatedData = createProductSchema.parse(data);
        
        const product = await prisma.product.create({
          data: {
            ...validatedData,
            sellerId: userId,
            status: 'pending',
          },
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return ApiResponse.success({ product }, 201);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return ApiResponse.validationError(
            'Invalid product data',
            error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          );
        }
        throw error;
      }
    }, ['seller', 'admin']);

    return handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.toResponse());
    }
    return ApiResponse.error('Failed to create product');
  }
}

/**
 * PATCH /api/marketplace/products/:id
 * Update product (owner or admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const handler = await withRoleCheck(async ({ userId, role }) => {
      const data = await request.json();
      
      try {
        const validatedData = createProductSchema.partial().parse(data);

        const product = await prisma.product.findUnique({
          where: { id: params.id },
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (!product) {
          return ApiResponse.notFound('Product not found');
        }

        if (role !== 'admin' && product.seller.id !== userId) {
          return ApiResponse.forbidden('Not authorized to update this product');
        }

        const updateData: Prisma.ProductUpdateInput = {
          ...validatedData,
          updatedAt: new Date(),
        };

        const updatedProduct = await prisma.product.update({
          where: { id: params.id },
          data: updateData,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return ApiResponse.success({ product: updatedProduct });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return ApiResponse.validationError(
            'Invalid product data',
            error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          );
        }
        throw error;
      }
    }, ['seller', 'admin']);

    return handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.toResponse());
    }
    return ApiResponse.error('Failed to update product');
  }
}

/**
 * DELETE /api/marketplace/products/:id
 * Delete product (owner or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const handler = await withRoleCheck(async ({ userId, role }) => {
      const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!product) {
        return ApiResponse.notFound('Product not found');
      }

      if (role !== 'admin' && product.seller.id !== userId) {
        return ApiResponse.forbidden('Not authorized to delete this product');
      }

      // Soft delete
      await prisma.product.update({
        where: { id: params.id },
        data: {
          status: 'removed',
          deletedAt: new Date(),
        },
      });

      return ApiResponse.success({ message: 'Product deleted successfully' });
    }, ['seller', 'admin']);

    return handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.toResponse());
    }
    return ApiResponse.error('Failed to delete product');
  }
}
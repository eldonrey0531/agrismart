import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  hasMarketplacePermission, 
  type MarketplaceAction 
} from '@/lib/marketplace/access-control';
import { ApiError } from '@/lib/error';
import { ApiResponse } from '@/lib/api-response';
import type { UserRole } from '@/lib/auth/roles';

/**
 * Verify marketplace permission middleware
 */
async function verifyPermission(
  request: NextRequest,
  action: MarketplaceAction
): Promise<{ userId: string; role: UserRole }> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    throw new ApiError('Unauthorized', 401);
  }

  const role = token.role as UserRole;
  
  if (!hasMarketplacePermission(role, action)) {
    throw new ApiError('Insufficient permissions for this action', 403);
  }

  return { userId: token.sub!, role };
}

/**
 * GET /api/marketplace/products
 * List products with role-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { role } = await verifyPermission(request, 'view_products');
    const { searchParams } = new URL(request.url);
    
    // Apply role-based filters
    const filters: Record<string, any> = {};
    
    if (role === 'seller') {
      // Sellers see their own products
      filters.sellerId = role;
    }
    
    // Add query filters
    if (searchParams.has('category')) {
      filters.category = searchParams.get('category');
    }
    
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status');
    }

    // TODO: Implement actual product fetching logic
    const products = []; // Fetch from database with filters

    return ApiResponse.success({ products });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to fetch products', 500);
  }
}

/**
 * POST /api/marketplace/products
 * Create new product (sellers only)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await verifyPermission(request, 'create_product');
    const data = await request.json();

    // Validate product data
    // TODO: Add proper validation

    // Create product
    const product = {
      ...data,
      sellerId: userId,
      createdAt: new Date(),
      status: 'active'
    };

    // TODO: Save to database

    return ApiResponse.success({ product }, 201);
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to create product', 500);
  }
}

/**
 * PUT /api/marketplace/products/:id
 * Update product (seller who owns it or admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role } = await verifyPermission(request, 'update_product');
    const data = await request.json();

    // TODO: Verify product ownership
    // TODO: Update product in database

    return ApiResponse.success({ message: 'Product updated successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to update product', 500);
  }
}

/**
 * DELETE /api/marketplace/products/:id
 * Delete product (seller who owns it or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role } = await verifyPermission(request, 'delete_product');

    // TODO: Verify product ownership
    // TODO: Delete or mark product as deleted

    return ApiResponse.success({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return ApiResponse.error(error.message, error.statusCode);
    }
    return ApiResponse.error('Failed to delete product', 500);
  }
}
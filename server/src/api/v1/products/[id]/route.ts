import { NextResponse } from 'next/server';
import { mockProducts } from '@/public/images/products/mock-data';

// Add timestamps to mock data
const productsWithTimestamps = mockProducts.map(product => ({
  ...product,
  createdAt: '2025-02-18T08:00:00.000Z',
  updatedAt: '2025-02-18T08:00:00.000Z',
}));

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = productsWithTimestamps.find(p => p.id === params.id);

  if (!product) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      },
      { status: 404 }
    );
  }

  // Get similar products (same category, excluding current product)
  const similarProducts = productsWithTimestamps
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return NextResponse.json({
    success: true,
    data: {
      product,
      similarProducts,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productIndex = productsWithTimestamps.findIndex(p => p.id === params.id);

  if (productIndex === -1) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      },
      { status: 404 }
    );
  }

  try {
    const updates = await request.json();
    
    // Update the product
    productsWithTimestamps[productIndex] = {
      ...productsWithTimestamps[productIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: productsWithTimestamps[productIndex],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid update data',
        },
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productIndex = productsWithTimestamps.findIndex(p => p.id === params.id);

  if (productIndex === -1) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Product not found',
        },
      },
      { status: 404 }
    );
  }

  // For mock data, we'll just mark it as deleted
  productsWithTimestamps[productIndex] = {
    ...productsWithTimestamps[productIndex],
    status: 'deleted' as const,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: { message: 'Product deleted successfully' },
  });
}
import { NextResponse } from 'next/server';
import { mockProducts } from '@/public/images/products/mock-data';

// Add timestamps to mock data
const productsWithTimestamps = mockProducts.map(product => ({
  ...product,
  createdAt: '2025-02-18T08:00:00.000Z',
  updatedAt: '2025-02-18T08:00:00.000Z',
}));

export async function GET(request: Request) {
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  // Filter products
  let filteredProducts = [...productsWithTimestamps];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.title.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }

  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === category
    );
  }

  // Calculate pagination
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    data: {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const product = await request.json();

    // Add mock id and timestamps
    const newProduct = {
      id: `product${productsWithTimestamps.length + 1}`,
      ...product,
      likes: 0,
      status: 'active',
      seller: {
        id: 'current-user',
        name: 'Test User',
        email: 'test@example.com',
        verified: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    productsWithTimestamps.push(newProduct);

    return NextResponse.json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid product data',
        },
      },
      { status: 400 }
    );
  }
}
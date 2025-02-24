import { Router } from 'express';
import { Request, Response } from 'express';
import { auth } from '../middleware/auth';
import { Product } from '../models/Product';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Base route /api/v1/marketplace
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Marketplace routes working',
    endpoints: {
      products: '/products',
      categories: '/categories'
    }
  });
});

// GET /api/v1/marketplace/products
router.get('/products', asyncHandler(async (req: Request, res: Response) => {
  const { 
    search, 
    category,
    page = 1, 
    limit = 10,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query: any = { status: 'active' };
  
  if (search) {
    query.$text = { $search: search as string };
  }
  
  if (category) {
    query.category = category;
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
      .populate('seller', 'name email'),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// GET /api/v1/marketplace/categories
router.get('/categories', asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Product.distinct('category', { status: 'active' });
  
  res.json({
    success: true,
    data: { categories }
  });
}));

export default router;
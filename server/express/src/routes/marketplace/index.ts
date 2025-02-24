import express from 'express';
import { RequestHandler } from '../../types';
import { asyncHandler } from '../../utils/express-utils';

const router = express.Router();

interface MarketplaceData {
  categories: any[];
  featuredProducts: any[];
  recentProducts: any[];
  trending: any[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

const getMarketplace: RequestHandler<MarketplaceData> = async (req, res) => {
  res.json({
    success: true,
    data: {
      categories: [
        {
          id: '1',
          name: 'Vegetables',
          description: 'Fresh organic vegetables',
          imageUrl: '/images/categories/vegetables.jpg',
          productCount: 150
        },
        {
          id: '2',
          name: 'Fruits',
          description: 'Fresh seasonal fruits',
          imageUrl: '/images/categories/fruits.jpg',
          productCount: 120
        }
      ],
      featuredProducts: [],
      recentProducts: [],
      trending: []
    }
  });
};

const getCategories: RequestHandler<Category[]> = async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'Vegetables',
        description: 'Fresh organic vegetables',
        imageUrl: '/images/categories/vegetables.jpg',
        productCount: 150
      },
      {
        id: '2',
        name: 'Fruits',
        description: 'Fresh seasonal fruits',
        imageUrl: '/images/categories/fruits.jpg',
        productCount: 120
      }
    ]
  });
};

const getFeatured: RequestHandler<any[]> = async (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

const getTrending: RequestHandler<any[]> = async (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

const getNew: RequestHandler<any[]> = async (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

// Register routes with async handler wrapping
router.get('/', asyncHandler(getMarketplace));
router.get('/categories', asyncHandler(getCategories));
router.get('/featured', asyncHandler(getFeatured));
router.get('/trending', asyncHandler(getTrending));
router.get('/new', asyncHandler(getNew));

export default router;
import { Router } from 'express';
import { MarketplaceController } from '../../controllers/marketplace';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { searchRateLimit } from '../../middleware/rate-limit';
import { marketplaceSchema } from '../../lib/validation/marketplace.schemas';

const router = Router();

// Public routes
router.get(
  '/featured',
  MarketplaceController.getFeaturedProducts
);

router.get(
  '/categories',
  MarketplaceController.getCategories
);

router.get(
  '/trending',
  MarketplaceController.getTrendingProducts
);

router.get(
  '/new-arrivals',
  MarketplaceController.getNewArrivals
);

router.get(
  '/best-sellers',
  MarketplaceController.getBestSellers
);

router.get(
  '/deals',
  MarketplaceController.getDeals
);

// Search routes with rate limiting
router.get(
  '/search',
  searchRateLimit,
  validate(marketplaceSchema.search),
  MarketplaceController.search
);

router.get(
  '/filters',
  MarketplaceController.getAvailableFilters
);

// Category routes
router.get(
  '/categories/:id/products',
  validate(marketplaceSchema.categoryProducts),
  MarketplaceController.getCategoryProducts
);

router.get(
  '/categories/:id/subcategories',
  validate(marketplaceSchema.id),
  MarketplaceController.getSubcategories
);

// Seller routes
router.get(
  '/sellers/:id',
  validate(marketplaceSchema.id),
  MarketplaceController.getSellerProfile
);

router.get(
  '/sellers/:id/products',
  validate(marketplaceSchema.sellerProducts),
  MarketplaceController.getSellerProducts
);

router.get(
  '/sellers/:id/reviews',
  validate(marketplaceSchema.sellerReviews),
  MarketplaceController.getSellerReviews
);

// Authenticated routes
router.use(authenticate);

// Seller management
router.get(
  '/seller/dashboard',
  MarketplaceController.getSellerDashboard
);

router.get(
  '/seller/orders',
  validate(marketplaceSchema.orders),
  MarketplaceController.getSellerOrders
);

router.get(
  '/seller/analytics',
  MarketplaceController.getSellerAnalytics
);

// Customer routes
router.get(
  '/recommended',
  MarketplaceController.getRecommendedProducts
);

router.get(
  '/recently-viewed',
  MarketplaceController.getRecentlyViewedProducts
);

router.get(
  '/saved-sellers',
  MarketplaceController.getSavedSellers
);

// Analytics and tracking
router.post(
  '/product/:id/view',
  validate(marketplaceSchema.id),
  MarketplaceController.trackProductView
);

router.post(
  '/seller/:id/view',
  validate(marketplaceSchema.id),
  MarketplaceController.trackSellerView
);

// Reviews and ratings
router.post(
  '/seller/:id/review',
  validate(marketplaceSchema.createSellerReview),
  MarketplaceController.createSellerReview
);

router.get(
  '/reviews/pending',
  MarketplaceController.getPendingReviews
);

// Seller following
router.post(
  '/seller/:id/follow',
  validate(marketplaceSchema.id),
  MarketplaceController.followSeller
);

router.post(
  '/seller/:id/unfollow',
  validate(marketplaceSchema.id),
  MarketplaceController.unfollowSeller
);

// Market insights
router.get(
  '/insights/trending-categories',
  MarketplaceController.getTrendingCategories
);

router.get(
  '/insights/price-trends',
  validate(marketplaceSchema.priceTrends),
  MarketplaceController.getPriceTrends
);

// Export marketplace router
export default router;
import { Router } from 'express';
import { auth } from '../middleware/auth';
import productInteractionController from '../controllers/productInteraction';

const router = Router();

// All routes require authentication
router.use(auth);

// Toggle product interaction (like/bookmark)
router.post('/toggle',
  productInteractionController.toggleInteraction
);

// Get stats for a specific product
router.get('/stats/:productId',
  productInteractionController.getProductStats
);

// Get user's interactions with multiple products
router.get('/user-interactions',
  productInteractionController.getUserInteractions
);

// Get popular products based on interactions
router.get('/popular',
  productInteractionController.getPopularProducts
);

// Get user's liked products
router.get('/likes',
  productInteractionController.getUserLikedProducts
);

// Get user's bookmarked products
router.get('/bookmarks',
  productInteractionController.getUserBookmarks
);

export default router;
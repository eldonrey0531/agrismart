import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace';
import { authenticateUser, requireActiveStatus, requireVerifiedSeller } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/products', MarketplaceController.search);
router.get('/products/:id', MarketplaceController.getProduct);

// Protected routes - require authentication and active status
router.use(authenticateUser, requireActiveStatus);

// Product management routes - require seller verification
router.post(
  '/products',
  requireVerifiedSeller,
  MarketplaceController.createProduct
);

// Product update/delete routes - require ownership verification
router.route('/products/:id')
  .all(MarketplaceController.checkProductOwnership)
  .put(MarketplaceController.updateProduct)
  .delete(MarketplaceController.deleteProduct);

// Image management routes
router.post(
  '/products/:id/images',
  requireVerifiedSeller,
  MarketplaceController.checkProductOwnership,
  upload.array('images', 5), // Use multer middleware with proper configuration
  MarketplaceController.uploadImages
);

router.delete(
  '/products/:id/images/:imageId',
  requireVerifiedSeller,
  MarketplaceController.checkProductOwnership,
  MarketplaceController.deleteImage
);

export default router;